import type { SourceCode } from "eslint";

export type LegacyContext = {
  getSourceCode: () => SourceCode;
};
