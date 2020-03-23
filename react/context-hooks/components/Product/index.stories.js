import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import imageTypes from '../../constants/imageTypes';

import Product from './index';

const data = {
  title: 'Orange Rancher Hat',
  price: 45,
  images: [
    {
      type: imageTypes.DEFAULT_RT,
      src: '/assets/orange-rancher-hat/default-rt.jpg'
    },
    {
      type: imageTypes.DEFAULT_SQ,
      src: '/assets/orange-rancher-hat/default-sq.jpg'
    }
  ]
};

export default { title: 'Product' };

export const regular = () => (
  <Product
    {...data}
    isFeatured={boolean('Featured', false)}
    isAdded={boolean('Added', false)}
    onClick={action('Add to Bag')}
  />
);

export const isFeatured = () => (
  <Product
    {...data}
    isFeatured={boolean('Featured', true)}
    onClick={action('Add to Bag')}
  />
);

export const isAdded = () => (
  <Product
    {...data}
    isAdded={boolean('Added', true)}
    onClick={action('Add to Bag')}
  />
);
