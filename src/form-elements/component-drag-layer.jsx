import React from 'react';
import { DragLayer } from 'react-dnd';
import ItemTypes from '../ItemTypes';
import { BoxDragPreview } from './component-drag-preview';
import SortableFormElements from '../sortable-form-elements';

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};
function getItemStyles(props) {
    const { initialOffset, currentOffset, itemType } = props;
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }
    let { x, y } = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;

    if (itemType === ItemTypes.CARD) {
      return {
        transform,
        WebkitTransform: transform,
      };
    }

    return {
        transform,
        WebkitTransform: transform,
        backgroundColor: '#E8F0FF',
        borderRadius: 8,
        border: '2px solid #1769FF',
    };
}
const CustomDragLayer = (props) => {
    const { item, itemType, isDragging } = props;
    const SortableFormElement = item && SortableFormElements[item.data.element];
    const sortableFormElementProps = {
      ...item,
      editModeOn: () => ({}),
      _onDestroy: () => ({}),
      showInlineEditForm: props.showInlineEditForm,
      isCustomDragLayer: true,
    };
    function renderItem() {
        switch (itemType) {
            case ItemTypes.BOX:
                return props.showInlineEditForm
                  ? <SortableFormElement {...sortableFormElementProps} />
                  : <BoxDragPreview item={item}/>;
            default:
                return null;
        }
    }
    if (!isDragging) {
        return null;
    }
    return (
      <div style={layerStyles}>
        <div style={getItemStyles(props)}>{renderItem()}</div>
      </div>);
};
export default DragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}))(CustomDragLayer);
