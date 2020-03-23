import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Button from './index';

export default { title: 'Button' };

export const regular = () => {
  const isDisabled = boolean('Disabled', false);
  const isAdded = boolean('Added',false);
  return (
    <Button disabled={isDisabled || isAdded} onClick={action('on-click')}>
      {isAdded ? 'Added' : 'Add to Bag'}
    </Button>
  )
};

export const disabled = () => (
  <Button disabled={true} onClick={action('on-click')}>
    Add to Bag
  </Button>
);

export const added = () => (
  <Button disabled={true} onClick={action('on-click')}>
    Added
  </Button>
);

