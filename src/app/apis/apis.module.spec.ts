import { APIsModule } from './apis.module';

describe('ApisModule', () => {
  let apisModule: APIsModule;

  beforeEach(() => {
    apisModule = new APIsModule();
  });

  it('should create an instance', () => {
    expect(apisModule).toBeTruthy();
  });
});
