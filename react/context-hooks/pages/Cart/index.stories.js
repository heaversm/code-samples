import React, { useEffect } from 'react';

import useAppContext from '../../hooks/useAppContext';
import AppContext from '../../contexts/AppContext';

import Cart from './index';

import mockProducts from '../../mocks/products';

export default {
  title: 'Cart',
  decorators: [(storyFn) => {
    const appContextValue = useAppContext();

    return (
      <AppContext.Provider value={appContextValue}>
        {storyFn(appContextValue)}
      </AppContext.Provider>
    )
  }],
};

export const empty = () => {
  return (
    <Cart/>
  )
};

export const withItem = (appContextValue) => {
  // eslint-disable-next-line
  useEffect(() => { appContextValue.addItem(mockProducts[1]);}, []);

  return (
    <Cart/>
  )
};
