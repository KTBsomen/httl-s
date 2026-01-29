/*!
 * HTTL-S — HyperText Templating Language (Simple)
 *
 * Copyright © 2026 Somen Das
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// ============================================================================
// LOADER
// ============================================================================

interface Loader {
    /**
     * Displays a loading spinner on the page
     * @param customHtml - Optional custom HTML for the spinner
     */
    show(customHtml?: string | null): void;

    /**
     * Hides and removes the loading spinner from the page
     */
    hide(): void;
}

declare const loader: Loader;

// ============================================================================
// STATE WATCHING
// ============================================================================

/**
 * List of watched variable names
 */
declare const watchedVars: string[];

/**
 * Creates a watched global variable that triggers a callback on value changes
 * @param propName - The name of the global variable to create
 * @param cb - Callback function(propName, newValue) called when value changes
 * @param defaultValue - Initial value for the variable
 */
declare function watch<T>(
    propName: string,
    cb: (propName: string, value: T) => void,
    defaultValue?: T
): void;

// ============================================================================
// EXPRESSION EVALUATION
// ============================================================================

/**
 * Safely evaluates a JavaScript expression with optional context variables
 * @param expression - Expression to evaluate
 * @param context - Optional context object with variables to inject
 * @returns Result of evaluation, or undefined on error
 */
declare function safeEval(expression: string, context?: Record<string, any>): any;

// ============================================================================
// TEMPLATE PARSING
// ============================================================================

/**
 * Parses JavaScript expressions inside {{}} in a template string
 * @param template - Template string containing {{expression}} placeholders
 * @returns Parsed template with expressions evaluated
 */
declare function parseTemplate(template: string): string;

/**
 * Creates an array of numbers from start to end with given step
 * @param start - Starting number
 * @param end - Ending number (inclusive)
 * @param step - Step increment (default: 1)
 * @returns Array of numbers
 */
declare function createRangeArray(start: number, end: number, step?: number): number[];

// ============================================================================
// DATA LOOPS
// ============================================================================

/**
 * Renders all elements with data-loop attribute
 * Used for table rows and other contexts where custom elements don't work
 */
declare function renderDataLoops(): void;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

interface SetStateOptions {
    /** Specific for-loop ID to update, or false for all */
    loopid?: string | false;
    /** Specific condition-block ID to update, or false for all */
    ifid?: string | false;
    /** Specific state-element ID to update, or false for all */
    stateId?: string | false;
    /** Whether to show loader during update (default: true) */
    showloader?: boolean;
    /** Whether to process data-js attributes (default: true) */
    datajs?: boolean;
    /** Whether to process data-innerhtml attributes (default: true) */
    innerhtml?: boolean;
    /** Whether to update for-loop elements (default: true) */
    loops?: boolean;
    /** Whether to update state-element elements (default: true) */
    states?: boolean;
    /** Whether to update data-loop elements (default: true) */
    dataloops?: boolean;
    /** Whether to update include-template elements (default: false) */
    templates?: boolean;
    /** Whether to update condition-block elements (default: true) */
    conditions?: boolean;
}

/**
 * Updates UI state by re-rendering specified components
 * @param options - Update options
 */
declare function setState(options?: SetStateOptions): void;

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Converts relative URLs in HTML to absolute URLs
 * @param htmlString - HTML string containing relative URLs
 * @param baseUrl - Base URL to resolve against
 * @returns HTML with absolute URLs
 */
declare function convertRelativeToAbsolute(htmlString: string, baseUrl: string): string;

/**
 * Extracts directory path from a URL
 * @param relativeUrl - URL to extract directory from
 * @returns Directory path
 */
declare function extractDirectory(relativeUrl: string): string;

interface UrlDetails {
    protocol: string;
    hostname: string;
    pathname: string;
    hash: string;
    params: Record<string, any>;
}

/**
 * Parses a URL and extracts its components
 * @param url - URL to parse (defaults to current location)
 * @param global - Whether to set UrlDetails on window (default: true)
 * @returns Parsed URL data
 */
declare function parseURL(url?: string, global?: boolean): UrlDetails;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the true type of a value
 * @param input - Value to check
 * @returns Type string: 'array', 'null', or typeof result
 */
declare function getType(input: any): 'array' | 'null' | 'string' | 'number' | 'boolean' | 'object' | 'function' | 'undefined';

/**
 * Encodes a value for passing via URL parameters
 * @param value - Value to encode
 * @returns URL-encoded string
 */
declare function passValue(value: any): string;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes all HTTL-S custom elements and renders data-loops.
 * Call this after DOM is ready (at end of body or in DOMContentLoaded).
 * Registers: for-loop, include-template, if-condition, else-condition,
 * condition-block, state-element
 */
declare function initState(): void;

// ============================================================================
// GLOBAL AUGMENTATION
// ============================================================================

declare global {
    interface Window {
        loader: Loader;
        watch: typeof watch;
        safeEval: typeof safeEval;
        parseTemplate: typeof parseTemplate;
        createRangeArray: typeof createRangeArray;
        setState: typeof setState;
        renderDataLoops: typeof renderDataLoops;
        convertRelativeToAbsolute: typeof convertRelativeToAbsolute;
        extractDirectory: typeof extractDirectory;
        getType: typeof getType;
        passValue: typeof passValue;
        parseURL: typeof parseURL;
        initState: typeof initState;
        UrlDetails: UrlDetails;
        watchedVars: string[];
    }
}

export { };
