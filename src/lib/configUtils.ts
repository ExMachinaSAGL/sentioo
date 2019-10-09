declare var require: any;

export interface ConfigFile {
  levels: PriorityLevel[];
  showUnreadText: boolean;
  excerptSize: number;
  dynamicIconColor: boolean;
  readParams?: string[];
  deleteParams?: string[];
}

export interface PriorityLevel {
  icon: string,
  color: string,
  backgroundColor: string,
  hoverColor: string
}

import Notification from './Notification'
// config file for priority levels
const configFile: ConfigFile = require('./../config/config.json');

type paramType = 'read' | 'delete';

/**
 * Converts the given query params into an URI string (i.e. `?key=value&key2=value2&...`)
 * @param params query params structured as an object (i.e. key <-> value)
 */
const serializeParams = (params: any): string => {
  const questionMark: string = params && Object.keys(params).length > 0 ? '?' : '';
  return questionMark + Object.keys(params)
    .map((key: string) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Build a query param URI string from a list of param names for the given notification.
 * @param notification the current notification
 * @param paramsNames list of parameter names (they must be properties of the Notification interface)
 */
const extractParams = (notification: any, paramsNames: string[] | undefined): string => {
  const params: { [key: string]: string } = {};
  if (!notification || !paramsNames) return '';

  paramsNames.forEach((paramName: string) => {
    if (notification[paramName]) {
      params[paramName] = notification[paramName]
    }
  });
  return paramsNames && paramsNames.length > 0 ? serializeParams(params) : '';
};

export default {
  config: configFile,
  overrideConfig(configProp: ConfigFile): void {
    this.config = configProp;
  },
  restoreConfig(): void {
    this.config = configFile
  },
  getLevel(priority: number): PriorityLevel {
    priority = priority || 0;
    if (!this.config.levels) {
      throw new Error('Invalid or missing config file');
    }
    priority = this.clamp(priority, 0, this.config.levels.length - 1);
    if (this.config.levels.length > 0) {
      const level: PriorityLevel = this.config.levels[priority];
      return level;
    } else {
      throw new Error('Priority levels array is empty');
    }
  },
  /**
   * Return the icon class corresponding to the given priority (clamped)
   * @param priority the priority level of the notification
   */
  getIconClasses(priority: number): string {
    return this.getLevel(priority).icon;
  },

  getIconColor(priority: number): string {
    return this.getLevel(priority).color;
  },

  /**
   * Build a query params string based on (optional) configured params for read and delete operations
   * @param notification the current notification object
   * @param type either 'read' or 'delete'
   */
  getParams(notification: Notification, type: paramType): string {
    if (type === 'read') {
      return extractParams(notification, this.config.readParams);
    } else if(type === 'delete') {
      return extractParams(notification, this.config.deleteParams);
    } else {
      return '';
    }
  },

  /**
   * Restrict a value to the given range
   */
  clamp(value: number, min: number, max: number): number {
    if (value > max) return max;
    else if (value < min) return min;
    else return value;
  }
}
