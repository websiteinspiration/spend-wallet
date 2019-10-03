export class CompareHelper {


  static compareObjects(obj1, obj2): boolean {
    if (!obj1 || !obj2) {
      return obj1 === obj2;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length === keys2.length) {
      for (let _i = 0; _i < keys1.length; _i++) {
        if (obj1[keys1[_i]] && obj1[keys1[_i]].constructor.name === 'Object') {
          if (!this.compareObjects(obj1[keys1[_i]], obj2[keys1[_i]])) {
            return false;
          }
        } else if ((keys1[_i] !== keys2[_i]) || obj1[keys1[_i]] !== obj2[keys1[_i]]) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }


  static compare(one: any, two: any): boolean {
    if (!one || !two) {
      return one === two;

    } else if (one.constructor.name === 'Array') {

      const oneLength = (one as Array<any>).length;
      const twoLength = (two as Array<any>).length;

      if (oneLength === twoLength) {
        for (let i = 0; i < oneLength; i++) {
          if (!this.compareObjects(one[i], two[i])) {
            return false;
          }
        }
      } else {
        return false;
      }
    } else if (one.constructor.name === 'object') {
      if (!this.compareObjects(one, two)) {
        return false;
      }
    }
    return true;
  }
}
