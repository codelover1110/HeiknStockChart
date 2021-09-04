import { useState } from 'react'

export const Dropdown = (props) => {
  const { items, title, icon, instance, handleClick, isActive } = props;
  const [isOpen, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  
  const toggleDropdown = () => setOpen(!isOpen);
  
  const handleItemClick = (id) => {
    setSelectedItem(id);
  }
  
  return (
    <div className='hunter-dropdown'>
      <div className='hunter-dropdown-header' onClick={toggleDropdown}>
        <i className={icon} />
        {title}
        <i className={`fa fa-chevron-right hunter-dropdown-icon icon ${isOpen && "open"}`}></i>
      </div>
      <div className={`hunter-dropdown-body ${isOpen && 'open'}`}>
        {items.map(item => (
          <div className={`hunter-dropdown-item ${isActive && item.id === selectedItem && 'hunter-selected'}`}
            onClick={e => {
              handleItemClick(item.id)
              handleClick(instance, item.pathname)
            }}
            id={item.id}
            key={`${instance}-${item.id}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}