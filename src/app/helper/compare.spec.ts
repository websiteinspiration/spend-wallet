import {CompareHelper} from './compare';

describe('compare', () => {

  it('should return true for 2 empty object', () => {
    const emptyObjects = CompareHelper.compareObjects({}, {});
    expect(emptyObjects).toBeTruthy();
  });

  it('should return false  if one of the object is null', () => {
    const emptyObjects = CompareHelper.compareObjects(null, {});
    expect(emptyObjects).toBeFalsy();
  });

  it('should return true  if both is null', () => {
    const emptyObjects = CompareHelper.compareObjects(null, null);
    expect(emptyObjects).toBeTruthy();
  });

  it('should return true  if both is the same ', () => {
    const emptyObjects = CompareHelper.compareObjects({x: 1}, {x: 1});
    expect(emptyObjects).toBeTruthy();
  });

  it('should return false  if both is are not the same ', () => {
    const emptyObjects = CompareHelper.compareObjects({x: 1}, {x: 1, y: 3});
    expect(emptyObjects).toBeFalsy();
  });

  it('should return true when nested object are the same', () => {
    const emptyObjects = CompareHelper.compareObjects({x: 1, y: {w: 1}}, {x: 1, y: {w: 1}});
    expect(emptyObjects).toBeTruthy();
  });

  it('should return false when nested object are not the same', () => {
    const emptyObjects = CompareHelper.compareObjects({x: 1, y: {w: 2}}, {x: 1, y: {w: 1}});
    expect(emptyObjects).toBeFalsy();
  });

  it('should return false when any arrays are null', () => {
    const emptyObjects = CompareHelper.compare(null, []);
    expect(emptyObjects).toBeFalsy();
  });

  it('should return true when arrays are empty', () => {
    const emptyObjects = CompareHelper.compare([], []);
    expect(emptyObjects).toBeTruthy();
  });

  it('should return true when arrays are empty', () => {
    const emptyObjects = CompareHelper.compare([{x: 1}], []);
    expect(emptyObjects).toBeFalsy();
  });

});
