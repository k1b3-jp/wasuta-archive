import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

export default {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
} as Meta;

const Template: Story<typeof ConfirmDialog> = (args: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialog = () => setIsDialogOpen(false);
  return (
    <ConfirmDialog {...args} isOpen={isDialogOpen} onClose={closeDialog} />
  );
};

export const OpenDialog = Template.bind({});
OpenDialog.args = {
  open: true,
  title: 'Delete this item?',
  text: 'This action cannot be undone.',
  confirmText: 'Delete',
};
