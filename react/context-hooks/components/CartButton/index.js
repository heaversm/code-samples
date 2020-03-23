import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import AppContext from '../../contexts/AppContext';
import {useHistory} from 'react-router-dom';

import bag from '../../assets/bag.svg';

import styles from './CartButton.module.scss';

const CartButton = ({ className, cartQuantity}) => {
  const history = useHistory();
  const { doFade } = useContext(AppContext);
  
  useEffect(() => {
    if (doFade){
      history.push('/Cart')
    };
  },[doFade,history]);

  
  const { cartClick } = useContext(AppContext);

  const buttonClasses = cx(
    styles.button,
    { [styles.empty]: !cartQuantity },
    className
  );

  return (
    <button className={buttonClasses} onClick={cartClick}>
      <span className={styles.icon}>
        <img src={bag} alt="shopping bag" />
      </span>
      {!!cartQuantity && (
        <span className={styles.quantity}>{cartQuantity}</span>
      )}
    </button>
  );
};

CartButton.propTypes = {
  cartQuantity: PropTypes.number,
  className: PropTypes.string
};

export default CartButton;
