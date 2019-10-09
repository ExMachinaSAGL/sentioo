import { expect } from 'chai';
import configUtils, { PriorityLevel, ConfigFile } from '../../../src/lib/configUtils';
import testUtils from '../lib/testUtils';
import Notification from '../../../src/lib/Notification'

describe('configUtils.ts', () => {
  let mockConfig: ConfigFile;
  let originalConfig: any;

  beforeEach(() => {
    mockConfig = {
      levels: [
        {
          icon: 'icon1',
          color: 'color1',
          backgroundColor: 'color1',
          hoverColor: 'color1'
        },
        {
          icon: 'icon2',
          color: 'color2',
          backgroundColor: 'color2',
          hoverColor: 'color2'
        }
      ],
      showUnreadText : false,
      excerptSize: 50,
      dynamicIconColor: false,
      readParams: ['type','title'],
      deleteParams: ['type']
    };
    configUtils.overrideConfig(mockConfig);
  });

  afterEach(() => {
    configUtils.restoreConfig();
  });

  it('should return the correct priority level data', () => {
    const resultCorrect1: PriorityLevel = configUtils.getLevel(0);
    const resultCorrect2: PriorityLevel = configUtils.getLevel(1);
    const resultUnder: PriorityLevel = configUtils.getLevel(-1);
    const resultOver: PriorityLevel = configUtils.getLevel(2);
    // const resultUndef: PriorityLevel = configUtils.getLevel(undefined);

    expect(resultCorrect1).to.eql(mockConfig.levels[0]);
    expect(resultCorrect2).to.eql(mockConfig.levels[1]);
    expect(resultUnder).to.eql(mockConfig.levels[0]);
    expect(resultOver).to.eql(mockConfig.levels[1]);
    // expect(resultUndef).to.eql(mockConfig.levels[0]);
  });

  it('should throw errors when the config is incorrect', () => {
    // configUtils.config.levels = null;
    // expect(configUtils.getLevel.bind(configUtils)).to.throw(/Invalid/);

    configUtils.config.levels = [];
    expect(configUtils.getLevel.bind(configUtils)).to.throw(/empty/);
  });

  it('should correctly build query strings with the given parameters', () => {
    const notification: Notification = testUtils.generateNotification('title', 'text', 2, 'broadcast');
    const multipleParams = configUtils.getParams(notification, 'read');
    expect(multipleParams).to.equal('?type=broadcast&title=title');
    configUtils.restoreConfig();

    const newMock: ConfigFile = JSON.parse(JSON.stringify(mockConfig));
    newMock.readParams = ['type'];
    configUtils.overrideConfig(newMock);
    const singleParam = configUtils.getParams(notification, 'read');
    expect(singleParam).to.equal('?type=broadcast');
    configUtils.restoreConfig();

    const newMock2: ConfigFile = JSON.parse(JSON.stringify(mockConfig));
    newMock2.readParams = [];
    configUtils.overrideConfig(newMock2);
    const noParams = configUtils.getParams(notification, 'read');
    expect(noParams).to.equal('');
  })
})
