import React from 'react';
import { action } from '@storybook/addon-actions';
import { number } from '@storybook/addon-knobs';

import Quantity from './index';

export default { title: 'Quantity' };

export const regular = () => (
  <Quantity
    onIncrement={action('on increment')}
    onDecrement={action('on decrement')}
    count={number('Quantity', 0)}
  />
);

export const withQuantity = () => (
  <Quantity
    onIncrement={action('on increment')}
    onDecrement={action('on decrement')}
    count={number('Quantity', 99)}
  />
);
