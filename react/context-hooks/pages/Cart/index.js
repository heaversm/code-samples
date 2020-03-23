import React, { useContext, useEffect, createRef } from 'react';
import cx from 'classnames';

import AppContext from '../../contexts/AppContext';

import Product from '../../components/Product';
import Button from '../../components/Button';

import empty from '../../assets/empty.png';
import close from '../../assets/close.svg';

import styles from './Cart.module.scss';


function Cart() {
  const { cartItems, checkout, incrementItem, decrementItem, cartClick } = useContext(
    AppContext
  );

  const modalRef = createRef();

  const innerClasses = cx(styles.inner, {
    [styles.empty]: !cartItems.length
  });

  const getFocusableElements = ()=>{
    return modalRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
  }

  useEffect(() => {
    function keyListener(e) {
      const listener = keyListenersMap.get(e.keyCode);
      return listener && listener(e);
    }
    document.addEventListener("keydown", keyListener);

    if (document.activeElement === document.body){
      const focusableModalElements = getFocusableElements();
      focusableModalElements[0].focus();
    }

    return () => document.removeEventListener("keydown", keyListener);
  });

  const handleTabKey = e => {
    //e.preventDefault();
    const focusableModalElements = getFocusableElements();

    const firstElement = focusableModalElements[0];
    const lastElement = focusableModalElements[focusableModalElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      return e.preventDefault();
    } 

    if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
    
  };

  const keyListenersMap = new Map([[27, cartClick], [9, handleTabKey]]);

  return (
    <div className={styles.wrapper}
      ref={modalRef}
    >
      <div className={innerClasses}>
        <button 
          className={styles.closeBtn}
          onClick={cartClick}
        >
          <img src={close} alt="close" />
        </button>

        {!!cartItems.length ? (
          <>
            <div className={cx(styles.products, styles.section)}>
              <h2 className={styles.heading}>Shopping Bag</h2>
              <ul className={styles.productList}>
                {cartItems.map(cartItem => (
                  <Product
                    {...cartItem}
                    className={styles.product}
                    key={cartItem.id}
                    onIncrement={() => incrementItem(cartItem)}
                    onDecrement={() => decrementItem(cartItem)}
                  />
                ))}
              </ul>
            </div>
            <div className={cx(styles.summary, styles.section)}>
              <h2 className={styles.heading}>Order Summary</h2>
              <div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryItem}>Subtotal</span>
                  <span className={cx(styles.summaryItem, styles.summaryPrice)}>
                    $0
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryItem}>Taxes</span>
                  <span className={cx(styles.summaryItem, styles.summaryPrice)}>
                    $0
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryItem}>Shipping</span>
                  <span className={cx(styles.summaryItem, styles.summaryPrice)}>
                    Free
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryItem}>Total</span>
                  <span
                    className={cx(
                      styles.summaryItem,
                      styles.summaryPrice,
                      styles.summaryItemBold
                    )}
                  >
                    $0
                  </span>
                </div>
              </div>
              <Button className={styles.checkoutBtn} onClick={checkout}>
                Checkout
              </Button>
            </div>
          </>
        ) : (
          <>
            <img className={styles.emptyImage} src={empty} alt="empty" />
            <p className={cx(styles.text, styles.emptyTitle)}>
              Your bag is empty
            </p>
            <p className={cx(styles.text, styles.emptyText)}>
              Please add some products to your cart
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;