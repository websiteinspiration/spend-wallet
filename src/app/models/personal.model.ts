export class Personal {
  public firstName: string;
  public lastName: string;
  public zipcode: string;
  public address: string;
  public address2: string;
  public day: number;
  public month: number;
  public year: number;
  public state: string;
  public country: string;
  public city: string;
  public username: string;


  orginal_firstName: string;
  orginal_lastName: string;
  orginal_zipcode: string;
  orginal_address: string;
  orginal_address2: string;
  orginal_day: number;
  orginal_month: number;
  orginal_year: number;
  orginal_state: string;
  orginal_country: string;
  orginal_city: string;

  public hasfirstName: boolean;
  public haslastName: boolean;
  public haszipcode: boolean;
  public hasaddress: boolean;
  public hasaddress2: boolean;
  public hasday: boolean;
  public hasmonth: boolean;
  public hasyear: boolean;
  public hasstate: boolean;
  public hascountry: boolean;
  public hascity: boolean;

  keys = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'zipcode',
    'address',
    'address2',
    'day',
    'month',
    'year',
    'state',
    'country',
    'city'
  ];

  editable: boolean;

  constructor(user) {

    for (const key of this.keys) {
      if (user.hasOwnProperty(key)) {
        this['has' + key] = true;
        this[key] = user[key];
        this['orginal_' + key] = user[key];
      }
    }
    if (!this.country) {
      this.country = 'CA';
    }
    if (user.hasOwnProperty('birthdate')) {
      const date = user.birthdate.split('-');
      this.day = date[2] * 1;
      this.month = date[1] * 1;
      this.year = date[0] * 1;

      this.orginal_day = this.day;
      this.orginal_month = this.month;
      this.orginal_year = this.year;

      this.hasday = true;
      this.hasmonth = true;
      this.hasyear = true;
    }
    this.username = user.username;
    this.hasaddress2 = true;
    this.editable = !(this.hasfirstName &&
      this.haslastName &&
      this.haszipcode &&
      this.hasaddress &&
      this.hasaddress2 &&
      this.hasday &&
      this.hasmonth &&
      this.hasyear &&
      this.hasstate &&
      this.hascountry &&
      this.hascity);
  }


  public getChanges() {
    const obj = {username: this.username};
    for (const key of this.keys) {
      if (!this['has' + key] && this['orginal_' + key] !== this[key]) {
        obj[key] = this[key];
      }
    }
    if (obj.hasOwnProperty('day') || obj.hasOwnProperty('month') || obj.hasOwnProperty('year')) {
      obj['birthdate'] = `${this.month}/${this.day}/${this.year}`;
      delete obj['day'];
      delete obj['month'];
      delete obj['year'];
    }
    return obj;

  }

}
