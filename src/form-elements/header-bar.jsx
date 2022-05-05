/**
  * <HeaderBar />
  */

import React from 'react';
import DragHandle from './component-drag-handle';
import useToggle from '../utils/hooks/useToggle';

const HeaderMenu = ({ onDestroy }) => {
  const { isOpen, toggle } = useToggle();

  const buttonList = [
    {
      icon: 'fas fa-arrows-alt',
      text: 'Move',
    },
    {
      icon: 'far fa-trash-alt',
      text: 'Delete',
      action: onDestroy,
    },
  ];

  return (
    <div className="toolbar-header-buttons">
      <button className="btn" onClick={toggle}>
        <i className="fas fa-ellipsis-v" />
      </button>
      {isOpen && (
        <div className='toolbar-header-submenu'>
          {buttonList.map(({ icon, action, text }) => (
            <button key={text} className="btn" onClick={action}>
              <i className={icon} />
              <span>{text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default class HeaderBar extends React.Component {
  render() {
    return (
      <div className="toolbar-header">
        <span className="badge badge-secondary">{this.props.data.text}</span>
        {this.props.showInlineEditForm && <HeaderMenu onDestroy={this.props.onDestroy.bind(this, this.props.data)}/>}
        {!this.props.showInlineEditForm && <div className="toolbar-header-buttons">
          {this.props.data.element !== 'LineBreak' &&
            <div className="btn is-isolated" onClick={this.props.editModeOn.bind(this.props.parent, this.props.data)}><i className="is-isolated fas fa-edit"></i></div>
          }
          <div className="btn is-isolated" onClick={this.props.onDestroy.bind(this, this.props.data)}><i className="is-isolated fas fa-trash"></i></div>
          {/* {!this.props.data.isContainer &&
            <DragHandle data={this.props.data} index={this.props.index} onDestroy={this.props.onDestroy} setAsChild={this.props.setAsChild} />
          } */}

          <DragHandle data={this.props.data} index={this.props.index} onDestroy={this.props.onDestroy} setAsChild={this.props.setAsChild} />
        </div>}
      </div>
    );
  }
}
