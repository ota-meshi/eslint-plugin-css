import { getRuleTester } from "eslint-compat-utils/rule-tester";
import { getLegacyESLint } from "eslint-compat-utils/eslint";
import { getLinter } from "eslint-compat-utils/linter";

export const RuleTester = getRuleTester();

export const LegacyESLint = getLegacyESLint();
export const Linter = getLinter();
