import React from 'react';
import './Button.css';

const Button = ({ className, ...props }) => (
  <button {...props} className={`button ${className}`} />
);

export default Button;
