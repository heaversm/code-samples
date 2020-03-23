import React, { useEffect } from 'react';

import useAppContext from '../../hooks/useAppContext';
import AppContext from '../../contexts/AppContext';

import ProductLanding from './index';
import mockProducts from '../../mocks/products';

export default {
  title: 'Product Landing',
  decorators: [(storyFn) => {
    const appContextValue = useAppContext();
    return (
      <AppContext.Provider value={appContextValue}>
        {storyFn(appContextValue)}
      </AppContext.Provider>
    )
  }],
};

export const regular = () => {
  return (
    <ProductLanding/>
  )
};

export const withCart = (appContextValue) => {
  // eslint-disable-next-line
  useEffect(() => { appContextValue.addItem(mockProducts[1]); }, []);

  return (
    <ProductLanding/>
  )
};
