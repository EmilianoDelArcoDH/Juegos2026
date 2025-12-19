// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type StorageProvider } from '..';
import Cloud from '../../UI/CustomSvgIcons/Cloud';

import {
  generateOnOpen,
  generateOnChooseSaveProjectAsLocation,
  generateOnSaveProjectAs,
  generateOnSaveProject,
  getWriteErrorMessage,
  getOpenErrorMessage,
} from './SupabaseProjectWriter';

const SupabaseStorageProvider: StorageProvider = {
  internalName: 'Supabase',
  name: t`Supabase Cloud`,
  renderIcon: props => <Cloud fontSize={props.size} />,

  // Camino B: SIN cuentas / SIN login
  needUserAuthentication: false,

  // No lo ocultes en Save dialog
  hiddenInSaveDialog: false,
  // Por ahora, si aún no querés “Abrir” desde Supabase, podés ocultarlo del Open dialog:
  hiddenInOpenDialog: true,

  createOperations: ({ setDialog, closeDialog, authenticatedUser }) => ({
    // OJO: ProjectStorageProviders "mantiene" el provider solo si existe onOpen. :contentReference[oaicite:2]{index=2}
    // Por eso lo definimos (aunque no lo uses todavía en UI).
    onOpen: generateOnOpen(authenticatedUser),

    onChooseSaveProjectAsLocation: generateOnChooseSaveProjectAsLocation({
      authenticatedUser,
      setDialog,
      closeDialog,
    }),
    onSaveProjectAs: generateOnSaveProjectAs(authenticatedUser, setDialog, closeDialog),
    onSaveProject: generateOnSaveProject(authenticatedUser),

    getOpenErrorMessage,
    getWriteErrorMessage,
  }),
};

export default SupabaseStorageProvider;
