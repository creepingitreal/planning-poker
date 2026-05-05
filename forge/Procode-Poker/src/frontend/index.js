import { view } from '@forge/bridge';

const context = await view.getContext();
const issueKey = context.extension.issue.key;

globalThis.open(`https://yourapp.com/?issue=${issueKey}`); // TODO URL