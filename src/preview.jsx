/**
  * <Preview />
  */

import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';
import store from './stores/store';
import FormElementsEdit from './form-dynamic-edit';
import SortableFormElements from './sortable-form-elements';
import CustomDragLayer from './form-elements/component-drag-layer';
import SortableDropTarget from './sortable-drop-target';

const { PlaceHolder } = SortableFormElements;

export default class Preview extends React.Component {
  state = {
    data: [],
    answer_data: {},
    currentHoveredCard: {
      id: '',
      isTop: true,
    },
  };

  constructor(props) {
    super(props);

    const { onLoad, onPost } = props;
    store.setExternalHandler(onLoad, onPost);

    this.editForm = React.createRef();
    this.state = {
      data: props.data || [],
      answer_data: {},
    };
    this.seq = 0;

    this._onUpdate = this._onChange.bind(this);
    this.getDataById = this.getDataById.bind(this);
    this.moveCard = this.moveCard.bind(this);
    this.insertCard = this.insertCard.bind(this);
    this.setAsChild = this.setAsChild.bind(this);
    this.removeChild = this.removeChild.bind(this);
    this._onDestroy = this._onDestroy.bind(this);
    this.setCurrentHoveredCard = this.setCurrentHoveredCard.bind(this);
  }

  componentDidMount() {
    const { data, url, saveUrl } = this.props;
    store.subscribe(state => this._onUpdate(state.data));
    store.dispatch('load', { loadUrl: url, saveUrl, data: data || [] });
    document.addEventListener('mousedown', this.editModeOff);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.editModeOff);
  }

  editModeOff = (e) => {
    if (this.editForm.current && !this.editForm.current.contains(e.target)) {
      this.manualEditModeOff();
    }
  }

  manualEditModeOff = () => {
    const { editElement } = this.props;
    if (editElement && editElement.dirty) {
      editElement.dirty = false;
      this.updateElement(editElement);
    }
    this.props.manualEditModeOff();
  }

  _setValue(text) {
    return text.replace(/[^A-Z0-9]+/ig, '_').toLowerCase();
  }

  updateElement(element) {
    const { data } = this.state;
    let found = false;

    for (let i = 0, len = data.length; i < len; i++) {
      if (element.id === data[i].id) {
        data[i] = element;
        found = true;
        break;
      }
    }

    if (found) {
      this.seq = this.seq > 100000 ? 0 : this.seq + 1;
      store.dispatch('updateOrder', data);
    }
  }

  _onChange(data) {
    const answer_data = {};

    data.forEach((item) => {
      if (item && item.readOnly && this.props.variables[item.variableKey]) {
        answer_data[item.field_name] = this.props.variables[item.variableKey];
      }
    });

    this.setState({
      data,
      answer_data,
    });
  }

  _onDestroy(item) {
    if (item.childItems) {
      item.childItems.forEach(x => {
        const child = this.getDataById(x);
        if (child) {
          store.dispatch('delete', child);
        }
      });
    }
    store.dispatch('delete', item);
  }

  getDataById(id) {
    const { data } = this.state;
    return data.find(x => x && x.id === id);
  }

  swapChildren(data, item, child, col) {
    if (child.col !== undefined && item.id !== child.parentId) {
      return false;
    }
    if (!(child.col !== undefined && child.col !== col && item.childItems[col])) {
      // No child was assigned yet in both source and target.
      return false;
    }
    const oldId = item.childItems[col];
    const oldItem = this.getDataById(oldId);
    const oldCol = child.col;
    // eslint-disable-next-line no-param-reassign
    item.childItems[oldCol] = oldId; oldItem.col = oldCol;
    // eslint-disable-next-line no-param-reassign
    item.childItems[col] = child.id; child.col = col;
    store.dispatch('updateOrder', data);
    return true;
  }

  setAsChild(item, child, col, isBusy) {
    const { data } = this.state;
    if (this.swapChildren(data, item, child, col)) {
      return;
    } if (isBusy) {
      return;
    }
    const oldParent = this.getDataById(child.parentId);
    const oldCol = child.col;
    // eslint-disable-next-line no-param-reassign
    item.childItems[col] = child.id; child.col = col;
    // eslint-disable-next-line no-param-reassign
    child.parentId = item.id;
    // eslint-disable-next-line no-param-reassign
    child.parentIndex = data.indexOf(item);
    if (oldParent) {
      oldParent.childItems[oldCol] = null;
    }
    const list = data.filter(x => x && x.parentId === item.id);
    const toRemove = list.filter(x => item.childItems.indexOf(x.id) === -1);
    let newData = data;
    if (toRemove.length) {
      // console.log('toRemove', toRemove);
      newData = data.filter(x => toRemove.indexOf(x) === -1);
    }
    if (!this.getDataById(child.id)) {
      newData.push(child);
    }
    store.dispatch('updateOrder', newData);
  }

  removeChild(item, col) {
    const { data } = this.state;
    const oldId = item.childItems[col];
    const oldItem = this.getDataById(oldId);
    if (oldItem) {
      const newData = data.filter(x => x !== oldItem);
      // eslint-disable-next-line no-param-reassign
      item.childItems[col] = null;
      // delete oldItem.parentId;
      this.seq = this.seq > 100000 ? 0 : this.seq + 1;
      store.dispatch('updateOrder', newData);
      this.setState({ data: newData });
    }
  }

  restoreCard(item, id) {
    const { data } = this.state;
    const parent = this.getDataById(item.data.parentId);
    const oldItem = this.getDataById(id);
    if (parent && oldItem) {
      const newIndex = data.indexOf(oldItem);
      const newData = [...data]; // data.filter(x => x !== oldItem);
      // eslint-disable-next-line no-param-reassign
      parent.childItems[oldItem.col] = null;
      delete oldItem.parentId;
      // eslint-disable-next-line no-param-reassign
      delete item.setAsChild;
      // eslint-disable-next-line no-param-reassign
      delete item.parentIndex;
      // eslint-disable-next-line no-param-reassign
      item.index = newIndex;
      this.seq = this.seq > 100000 ? 0 : this.seq + 1;
      store.dispatch('updateOrder', newData);
      this.setState({ data: newData });
    }
  }

  insertCard(item, hoverIndex, id) {
    const { data } = this.state;
    if (id) {
      this.restoreCard(item, id);
    } else {
      const targetIndex = hoverIndex === -1 ? data.length : hoverIndex;
      data.splice(targetIndex, 0, item);
      this.saveData(item, targetIndex, targetIndex);
    }
  }

  moveCard(dragIndex, hoverIndex) {
    const { data } = this.state;
    const dragCard = data[dragIndex];
    if (!dragCard) return;
    this.saveData(dragCard, dragIndex, hoverIndex);
  }

  // eslint-disable-next-line no-unused-vars
  cardPlaceHolder(dragIndex, hoverIndex) {
    // Dummy
  }

  saveData(dragCard, dragIndex, hoverIndex) {
    const newData = update(this.state, {
      data: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
      },
    });
    this.setState(newData);
    store.dispatch('updateOrder', newData.data);
  }

  setCurrentHoveredCard({ id, isTop }) {
    this.setState({ currentHoveredCard: { id, isTop } });
  }

  getElement(item, index) {
    if (item.custom) {
      if (!item.component || typeof item.component !== 'function') {
        // eslint-disable-next-line no-param-reassign
        item.component = this.props.registry.get(item.key);
      }
    }
    const SortableFormElement = SortableFormElements[item.element];

    if (SortableFormElement === null) {
      return null;
    }

    const showFormElement = this.props.editElement === null || (this.props.editElement.id !== item.id);
    const showFormElementEditor = this.props.showInlineEditForm && (this.props.editElement !== null && this.props.editElement.id === item.id);


    if (showFormElement) {
      return (<SortableFormElement
        id={item.id}
        seq={this.seq}
        index={index}
        moveCard={this.moveCard}
        insertCard={this.insertCard}
        mutable={false}
        parent={this.props.parent}
        editModeOn={this.props.editModeOn}
        isDraggable={true}
        key={item.id}
        sortData={item.id}
        data={item}
        getDataById={this.getDataById}
        setAsChild={this.setAsChild}
        removeChild={this.removeChild}
        _onDestroy={this._onDestroy}
        showInlineEditForm={this.props.showInlineEditForm}
        setCurrentHoveredCard={this.setCurrentHoveredCard}
        currentHoveredCard={this.state.currentHoveredCard}
      />);
    }

    if (showFormElementEditor) {
      return (
        <div className="edit-form" ref={this.editForm}>
          {this.showEditForm()}
        </div>
      );
    }

    return null;
  }

  showEditForm() {
    const handleUpdateElement = (element) => this.updateElement(element);
    handleUpdateElement.bind(this);

    const formElementEditProps = {
      showCorrectColumn: this.props.showCorrectColumn,
      files: this.props.files,
      manualEditModeOff: this.manualEditModeOff,
      preview: this,
      element: this.props.editElement,
      updateElement: handleUpdateElement,
    };

    return this.props.renderEditForm(formElementEditProps);
  }

  showHeaderButtons() {
    return (
      <div className='react-form-builder-header'>
        <div className='react-form-builder-header__inner'>
          {this.props.onPreviewButton && <button className='button button--primary' onClick={this.props.onPreviewButton}>Preview</button>}
          {this.props.onPublishButton && <button className='button button--primary' onClick={this.props.onPublishButton}>Publish</button>}
        </div>
      </div>
    );
  }

  showFormTitleInput() {
    return (
      <label htmlFor='title' className='react-form-builder-title'>
        <span>Waiver title</span>
        <input name='title' onChange={(event) => this.props.setFormTitle(event.target.value)}/>
      </label>
    );
  }

  render() {
    let classes = this.props.className;
    if (this.props.editMode) { classes += ' is-editing'; }
    if (this.props.showInlineEditForm) { classes += ' inline-edit-form-is-on'; }
    const data = this.state.data.filter(x => !!x && !x.parentId);
    const items = data.map((item, index) => this.getElement(item, index));
    return (
      <div className={classes}>
        {this.showHeaderButtons()}
        {this.showFormTitleInput()}
        {!this.props.showInlineEditForm &&
          <>
            <div className="edit-form" ref={this.editForm}>
              {this.props.editElement !== null && this.showEditForm()}
            </div>
            <div className="Sortable">{items}</div>
            <PlaceHolder
              id="form-place-holder"
              show={items.length === 0}
              index={items.length}
              moveCard={this.cardPlaceHolder}
              insertCard={this.insertCard}
              text="Drag and drop a feature"
            />
          </>
        }
        {this.props.showInlineEditForm && <SortableDropTarget insertCard={this.insertCard} list={items} setCurrentHoveredCard={this.setCurrentHoveredCard} />}
        <CustomDragLayer showInlineEditForm={this.props.showInlineEditForm}/>
      </div>
    );
  }
}
Preview.defaultProps = {
  showCorrectColumn: false,
  files: [],
  editMode: false,
  editElement: null,
  className: 'col-md-9 react-form-builder-preview float-left',
  renderEditForm: props => <FormElementsEdit {...props} />,
};
