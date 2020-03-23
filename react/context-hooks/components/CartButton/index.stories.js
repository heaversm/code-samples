import React from 'react';
import { number } from '@storybook/addon-knobs';

import useAppContext from '../../hooks/useAppContext';
import AppContext from '../../contexts/AppContext';

import CartButton from './index';

export default {
  title: 'CartButton',
  decorators: [(storyFn) => {
    const appContextValue = useAppContext();
    return (
      <AppContext.Provider value={appContextValue}>
        {storyFn(appContextValue)}
      </AppContext.Provider>
    )
  }],
};

export const regular = () => (
  <CartButton cartQuantity={number('Quantity', 3)}/>
);

export const noItems = () => (
  <CartButton cartQuantity={number('Quantity', 0)}/>
);
