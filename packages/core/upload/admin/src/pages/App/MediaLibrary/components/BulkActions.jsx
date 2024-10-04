import React from 'react';

import { Flex, Typography } from '@strapi/design-system';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { AssetDefinition, FolderDefinition } from '../../../../constants';
import getTrad from '../../../../utils/getTrad';

import { BulkDeleteButton } from './BulkDeleteButton';
import { BulkMoveButton } from './BulkMoveButton';

export const BulkActions = ({ selected, onSuccess, currentFolder }) => {
  const { formatMessage } = useIntl();

  return (
    <Flex gap={2} paddingBottom={5}>
      <BulkDeleteButton selected={selected} onSuccess={onSuccess} />
    </Flex>
  );
};

BulkActions.defaultProps = {
  currentFolder: undefined,
};

BulkActions.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  currentFolder: FolderDefinition,
  selected: PropTypes.arrayOf(AssetDefinition, FolderDefinition).isRequired,
};
