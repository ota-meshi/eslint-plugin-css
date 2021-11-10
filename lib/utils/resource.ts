export const MATH_FUNCTIONS = new Set(["calc", "clamp", "max", "min"])

export const NON_LENGTH_UNITS = new Set([
    // Relative length units
    "%",
    // Time length units
    "s",
    "ms",
    // Angle
    "deg",
    "grad",
    "turn",
    "rad",
    // Frequency
    "Hz",
    "kHz",
    // Resolution
    "dpi",
    "dpcm",
    "dppx",
])

export const LENGTH_UNITS = new Set([
    // Relative length units
    "em",
    "ex",
    "ch",
    "rem",
    "rlh",
    "lh",
    // Viewport-percentage lengths
    "vh",
    "vw",
    "vmin",
    "vmax",
    "vm",
    // Absolute length units
    "px",
    "mm",
    "cm",
    "in",
    "pt",
    "pc",
    "q",
    "mozmm",
    // Flexible length units
    "fr",
])

export const UNITS = new Set([...LENGTH_UNITS, ...NON_LENGTH_UNITS])
