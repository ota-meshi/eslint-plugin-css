import { colord, getFormat, extend, Colord } from "colord"

import namesPlugin from "colord/plugins/names"
import hwbPlugin from "colord/plugins/hwb"
import labPlugin from "colord/plugins/lab"
import lchPlugin from "colord/plugins/lch"

extend([namesPlugin, hwbPlugin, labPlugin, lchPlugin])

export { colord as parseColord, getFormat as getColorFormat, Colord }
