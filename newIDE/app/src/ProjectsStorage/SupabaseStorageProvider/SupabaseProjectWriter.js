// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  type FileMetadata,
  type SaveAsLocation,
  type SaveAsOptions,
} from '..';

import { saveProjectToBackend, openProjectFromBackend } from './SupabaseBackendApi';

const generateProjectId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getWriteErrorMessage = (_error: Error): MessageDescriptor =>
  t`An error occurred when saving the project. Please try again.`;

export const getOpenErrorMessage = (_error: Error): MessageDescriptor =>
  t`An error occurred when opening the project. Please try again.`;

// ✅ onOpen (necesario para que ProjectStorageProviders “mantenga” el provider) :contentReference[oaicite:3]{index=3}
export const generateOnOpen =
  (_authenticatedUser: any) =>
  async (fileMetadata: FileMetadata): Promise<{| content: Object |}> => {
    const projectId = fileMetadata.fileIdentifier;
    const content = await openProjectFromBackend({ projectId });
    return { content };
  };

export const generateOnChooseSaveProjectAsLocation =
  ({
    authenticatedUser,
    setDialog,
    closeDialog,
  }: {|
    authenticatedUser: any,
    setDialog: (() => React.Node) => void,
    closeDialog: () => void,
  |}) =>
  async ({
    project,
    fileMetadata,
    displayOptionToGenerateNewProjectUuid,
  }: {|
    project: gdProject,
    fileMetadata: ?FileMetadata,
    displayOptionToGenerateNewProjectUuid: boolean,
  |}): Promise<{|
    saveAsLocation: ?SaveAsLocation,
    saveAsOptions: ?SaveAsOptions,
  |}> => {
    const projectId: string = fileMetadata?.fileIdentifier || generateProjectId();
    const projectName: string =
      project?.getName && typeof project.getName === 'function'
        ? project.getName()
        : 'Untitled project';

    return {
      saveAsLocation: { fileIdentifier: projectId, name: projectName },
      saveAsOptions: {
        generateNewProjectUuid: false,
        setProjectNameFromLocation: false,
      },
    };
  };

export const generateOnSaveProjectAs =
  (authenticatedUser: any, setDialog: any, closeDialog: any) =>
  async (
    project: gdProject,
    saveAsLocation: ?SaveAsLocation,
    options: {| onStartSaving: () => void, onMoveResources: ({| newFileMetadata: FileMetadata |}) => Promise<void> |}
  ): Promise<{| wasSaved: boolean, fileMetadata: ?FileMetadata |}> => {
    options.onStartSaving();

    const projectId: string =
      (saveAsLocation && saveAsLocation.fileIdentifier) || generateProjectId();

    const name: string =
      (saveAsLocation && saveAsLocation.name) ||
      (project?.getName && typeof project.getName === 'function'
        ? project.getName()
        : 'Untitled project');

    const json: Object =
      project?.saveToJSON && typeof project.saveToJSON === 'function'
        ? project.saveToJSON()
        : { name };

    await saveProjectToBackend({ projectId, name, json });

    const newFileMetadata: FileMetadata = {
      fileIdentifier: projectId,
      name,
      lastModifiedDate: Date.now(),
    };

    await options.onMoveResources({ newFileMetadata });

    return { wasSaved: true, fileMetadata: newFileMetadata };
  };

export const generateOnSaveProject =
  (_authenticatedUser: any) =>
  async (
    project: gdProject,
    fileMetadata: FileMetadata
  ): Promise<{| wasSaved: boolean, fileMetadata: FileMetadata |}> => {
    const projectId: string = fileMetadata.fileIdentifier;

    const name: string =
      fileMetadata.name ||
      (project?.getName && typeof project.getName === 'function'
        ? project.getName()
        : 'Untitled project');

    const json: Object =
      project?.saveToJSON && typeof project.saveToJSON === 'function'
        ? project.saveToJSON()
        : { name };

    await saveProjectToBackend({ projectId, name, json });

    return {
      wasSaved: true,
      fileMetadata: { ...fileMetadata, name, lastModifiedDate: Date.now() },
    };
  };
