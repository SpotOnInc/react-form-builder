import React, { Component } from 'react';
import ComponentHeader from './component-header';
import ComponentLabel from './component-label';
import DragHandle from './component-drag-handle';

class CustomElement extends Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const { bare } = this.props.data;
    const props = {};
    props.name = this.props.data.field_name;
    props.defaultValue = this.props.defaultValue;

    if (this.props.mutable && this.props.data.forwardRef) {
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    // Return if component is invalid.
    if (!this.props.data.component) return null;
    const Element = this.props.data.component;

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) { baseClasses += ' alwaysbreak'; }

    const renderCustomElementInner = () => (
      <div className={baseClasses}>
        {!this.props.showInlineEditForm && <ComponentHeader {...this.props} />}
        { bare ?
          <Element data={this.props.data} {...this.props.data.props} {...props} /> :
          <div className="form-group">
            <ComponentLabel className="form-label" {...this.props} />
            <Element data={this.props.data} {...this.props.data.props} {...props} />
          </div>
        }
      </div>
    );

    return this.props.showInlineEditForm
      ? <DragHandle
          data={this.props.data}
          index={this.props.index}
          onDestroy={this.props.onDestroy}
          setAsChild={this.props.setAsChild}
          showInlineEditForm={this.props.showInlineEditForm}
        >
          {renderCustomElementInner()}
        </DragHandle>
      : renderCustomElementInner();
  }
}

CustomElement.propTypes = {};

export default CustomElement;
