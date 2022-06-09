import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import ItemTypes from './ItemTypes';

class SortableDropTarget extends Component {
  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    return connectDropTarget(
      <div className={classNames('Sortable', { 'can-drop': isActive })}>
        {!this.props.list.length && <p className='sortable-drop-target__placeholder'>Drag and drop a feature</p>}
        {this.props.list}
      </div>,
    );
  }
}

const cardTarget = {
  drop(props, monitor) {
    const item = monitor.getItem();
    const dragIndex = item.index;
    if (item.onCreate) {
      props.insertCard(item.onCreate(item.data), dragIndex + 1);
      props.setCurrentHoveredCard({ id: '' });
    }
  },
};

export default DropTarget([ItemTypes.CARD, ItemTypes.BOX], cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(SortableDropTarget);
