import React from 'react';

function useToggle(defaultValue = false) {
  const [isOpen, setIsOpen] = React.useState(defaultValue);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return { isOpen, toggle, close };
}

export default useToggle;
