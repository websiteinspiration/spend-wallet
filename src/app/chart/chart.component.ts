import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter, HostListener, OnChanges} from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Input() option: any;
  @Input() symbol: any;
  @Output() changeFilter: EventEmitter<number> = new EventEmitter();

  @ViewChild('svg') svgElement: ElementRef;
  @ViewChild('chartContainer') container: ElementRef;

  width = 0;
  height = 300;
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  config = {
    xTicks: 6,
    yTicks: 4,
    margin: {
      top: 10,
      right: 110,
      bottom: 50,
      left: 0
    }
  };
  svg = null;
  line = null;
  linePoint;
  lineBottomBox;
  lineTopBox;
  marketCap;
  volume;
  circSupply;
  maxSupply;
  scrollLeft = 0;
  barWidth = 0;

  constructor() {
  }

  ngOnInit() {
    this.linePoint = document.getElementById('line-point');
    this.lineBottomBox = document.getElementById('line-bottom-box');
    this.lineTopBox = document.getElementById('line-top-box');
  }

  selectPeriod(type, index) {
    this.changeFilter.emit(type);
  }

  getData() {
    this.data.price.sort(function (a, b) {
      if (a.date > b.date) {
        return 1;
      } else if (a.date < b.date) {
        return -1;
      }
      return 0;
    }).forEach(p => {
      for (let i = 0; i < this.data.marketCap.length; i++) {
        if (typeof p.date === 'string' && this.data.marketCap[i].date.substr(0, 16) === p.date.substr(0, 16)) {
          p.marketCap = this.data.marketCap[i].amount;
          p.marketCapFormatted = this.data.marketCap[i].amountFormatted;
          break;
        }
      }
      for (let i = 0; i < this.data.volume.length; i++) {
        if (typeof p.date === 'string' && this.data.volume[i].date.substr(0, 16) === p.date.substr(0, 16)) {
          p.volume = this.data.volume[i].amount;
          p.volumeFormatted = this.data.volume[i].amountFormatted;
          break;
        }
      }
    });

    if (this.data.price.length > 0) {
      this.showDetailData(this.data.price[0]);
    }
  }

  changeConfig() {
    switch (this.option) {
      case '24h':
      break;
      case '7d':
      break;
      case '1m':
      break;
      case '3m':
      break;
      case '1y':
      break;
      case 'all':
      break;
    }
  }

  showDetailData(data) {
    this.marketCap.innerHTML = data.marketCapFormatted;
    this.volume.innerHTML = data.volumeFormatted;
    this.circSupply.innerHTML = this.symbol.marketData.totalSupplyFormatted !== '0'
                                ? `${this.symbol.marketData.totalSupplyFormatted} ${this.symbol.symbol}`
                                : 'N/A';
    this.maxSupply.innerHTML = this.symbol.marketData.maxSupplyFormatted !== '0'
                                ? `${this.symbol.marketData.maxSupplyFormatted} ${this.symbol.symbol}`
                                : 'N/A';
  }

  initSvg() {
    this.svg = d3.select(this.svgElement.nativeElement);
    this.svg.attr('width', this.width)
      .attr('height', this.height);
    this.svg.selectAll('*').remove();
  }

  drawGrid() {
    const yDelta = (this.height - this.config.margin.bottom) / this.config.yTicks;
    const xDelta = (this.width - this.config.margin.right) / this.config.xTicks;
    const yMax = d3.max(this.data.price, d => parseFloat(d.amount));
    const yMin = d3.min(this.data.price, d => parseFloat(d.amount));
    const fontSize = 20;
    for (let i = 0 ; i < this.config.yTicks ; i ++) {
      this.svg.append('line')
        .attr('x1', 0)
        .attr('y1', ((this.height - this.config.margin.bottom) / this.config.yTicks) * (i + 1))
        .attr('x2', this.width)
        .attr('y2', ((this.height - this.config.margin.bottom) / this.config.yTicks) * (i + 1))
        .attr('stroke', '#dddddd')
        .attr('stroke-width', 2);
      this.svg.append('text')
        .attr('x', yMax.toFixed().length > 3 ? this.width - this.config.margin.right + 10 : this.width - this.config.margin.right + 20)
        .attr('y', ((this.height - this.config.margin.bottom) / this.config.yTicks) * i + (yDelta - fontSize) / 2 + fontSize)
        .text('$' + (yMax - (yMax - yMin) * i / this.config.yTicks).toFixed(2))
        .attr('fill', '#dddddd')
        .style('font-size', fontSize);
    }

    let days = [];
    const hours = [];
    const deltaXAxis = Math.floor(this.data.price.length / this.config.xTicks);
    this.data.price.forEach((d, index) => {
      const day = new Date(d.date).getDate() + ' ' + this.months[new Date(d.date).getMonth()];
      if (index % deltaXAxis === Math.floor(deltaXAxis / 2)) {
        if (this.option === '1y') {
          days.push(day);
        } else if (this.option === 'all') {
          days.push(new Date(d.date).getFullYear());
        } else {
          if (this.option === '24h') {
            hours.push(this.getFormattedTime(d.date));
          } else {
            days.push(day);
          }
        }
      }
    });
    for (let i = 0 ; i < this.config.xTicks ; i ++) {
      this.svg.append('line')
        .attr('x1', xDelta * (i + 1))
        .attr('y1', 0)
        .attr('x2', xDelta * (i + 1))
        .attr('y2', this.height - this.config.margin.bottom)
        .attr('stroke', '#dddddd')
        .attr('stroke-width', 2);
      this.svg.append('text')
        .attr('x', xDelta * i + (xDelta - 50) / 2)
        .attr('y', this.height - this.config.margin.bottom + 20)
        .text(this.option === '24h' ? hours[i] : days[i])
        .attr('fill', '#dddddd')
        .style('font-size', 16);
    }
  }

  drawLineChart() {
    this.data.price.forEach(p => {
      p.amount = +p.amount;
      p.date = new Date(p.date);
    });
    const xLine = d3.scaleTime().range([this.config.margin.left, this.width - this.config.margin.right]);
    const yLine = d3.scaleLinear().range([this.height - this.config.margin.bottom, this.config.margin.top]);
    xLine.domain([
      d3.min(this.data.price, function (d) {
        return d.date;
      }),
      d3.max(this.data.price, function (d) {
        return d.date;
      })]);
    yLine.domain([
      d3.min(this.data.price, function (d) {
        return d.amount;
      }),
      d3.max(this.data.price, function (d) {
        return d.amount;
      })]).nice();

    this.line = d3.line()
      .x(function(d, i) { return xLine(d.date); })
      .y(function(d) { return yLine(d.amount); });
    this.svg.append('path')
      .datum(this.data.price)
      .attr('class', 'line')
      .attr('d', this.line);

    this.svg.append('line')
      .attr('x1', -5)
      .attr('x2', -5)
      .attr('y1', 0)
      .attr('y2', this.height - this.config.margin.bottom)
      .attr('class', 'tooltipLine')
      .attr('stroke', '#2574c7')
      .attr('stroke-width', 2)
      .style('stroke-dasharray', 6);

    this.svg.append('rect')
      .attr('class', 'hover-rect')
      .attr('width', this.width - this.config.margin.right)
      .attr('height', this.height - this.config.margin.bottom)
      .attr('opacity', 0)
      .on('mousemove', (d) => this.drawLineTooltip())
      .on('mouseout', (d) => this.removeLineTooltip());
  }

  removeLineTooltip() {
    this.linePoint.style.display = 'none';
    this.lineTopBox.style.display = 'none';
    this.lineBottomBox.style.display = 'none';
    this.svg.selectAll('.bar').attr('fill', '#c5c5c5');
    this.svg.selectAll('.tooltipLine')
      .attr('x1', -5)
      .attr('x2', -5);
  }

  drawLineTooltip() {
    this.lineBottomBox.style.display = 'block';
    this.lineTopBox.style.display = 'block';
    const xLine = d3.scaleTime().range([this.config.margin.left, this.width - this.config.margin.right]);
    const yLine = d3.scaleLinear().range([this.height - this.config.margin.bottom, this.config.margin.top]);
    xLine.domain([
      d3.min(this.data.price, function (d) {
        return d.date;
      }),
      d3.max(this.data.price, function (d) {
        return d.date;
      })]);
    yLine.domain([
      d3.min(this.data.price, function (d) {
        return d.amount;
      }),
      d3.max(this.data.price, function (d) {
        return d.amount;
      })]).nice();

    const date = xLine.invert(d3.event.offsetX);
    this.data.price.forEach((p, i) => {
      if (i < this.data.price.length - 1 && xLine(p.date) < xLine(date) && xLine(date) < xLine(this.data.price[i + 1].date)) {
        if (xLine(p.date) - this.scrollLeft < 0) {
          this.removeLineTooltip();
        } else {
          this.svg.selectAll('.tooltipLine')
            .attr('x1', xLine(p.date) + this.barWidth / 2)
            .attr('x2', xLine(p.date) + this.barWidth / 2);
          this.lineTopBox.innerHTML = p.amountFormatted;
          this.lineTopBox.style.left = xLine(p.date) - this.scrollLeft - 50 + 'px';
          this.lineBottomBox.style.left = xLine(p.date) - this.scrollLeft - 50 + 'px';
          this.lineBottomBox.style.top = this.height - this.config.margin.bottom + 'px';
          this.showDetailData(p);
          this.svg.selectAll('.bar').attr('fill', '#c5c5c5');
          this.svg.selectAll('.bar-' + i).attr('fill', '#2574c7');
        }
        if (this.option === '24h') {
          this.lineBottomBox.innerHTML = this.getFormattedTime(p.date);
        } else {
          const day = new Date(p.date).getDate() + ' ' + this.months[new Date(p.date).getMonth()];
          if (['7d', '1m', '3m'].indexOf(this.option) !== -1) {
            this.lineBottomBox.innerHTML = day;
          } else {
            this.lineBottomBox.innerHTML = day + ', ' + new Date(p.date).getFullYear();
          }
        }
      }
    });
  }

  getFormattedTime(dateString) {
    return ('0' + new Date(dateString).getHours()).slice(-2) + ':' + ('0' + new Date(dateString).getMinutes()).slice(-2);
  }

  drawBarChart() {
    this.data.price.forEach(p => {
      p.amount = +p.amount;
      p.date = new Date(p.date);
    });
    const xBar = d3.scaleTime().range([this.config.margin.left, this.width - this.config.margin.right]);
    const yBar = d3.scaleLinear().range([this.height - this.config.margin.bottom, (this.height - this.config.margin.bottom) / 2]);
    const yDelta = this.height - this.config.margin.bottom;
    xBar.domain([
      d3.min(this.data.price, function (d) {
        return d.date;
      }),
      d3.max(this.data.price, function (d) {
        return d.date;
      })]);
    yBar.domain([
      d3.min(this.data.price, function (d) {
        return d.amount;
      }),
      d3.max(this.data.price, function (d) {
        return d.amount;
      })]).nice();
    const that = this;
    this.svg.selectAll('.bar-chart').data(this.data.price)
      .enter().append('rect')
      .attr('x', function(d) { return xBar(d.date); })
      .attr('y', function(d) { return yBar(d.amount) - 10; })
      .attr('class', function(d, i) { return 'bar bar-' + i; })
      .attr('width', function(d, i) {
        if (i < that.data.price.length - 1) {
          that.barWidth = ((that.width - that.config.margin.right - that.config.margin.left) / that.data.price.length);
          return that.barWidth;
        } else {
          return 0;
        }
      })
      .attr('height', function(d) { return yDelta - yBar(d.amount) + 10; })
      .attr('fill', '#c5c5c5');
  }

  loadChart() {
    this.changeConfig();
    this.initSvg();
    this.drawGrid();
    this.drawBarChart();
    this.drawLineChart();
  }

  ngOnChanges() {
    this.marketCap = document.getElementById('marketCap');
    this.volume = document.getElementById('volume');
    this.circSupply = document.getElementById('circSupply');
    this.maxSupply = document.getElementById('maxSupply');
    if (this.data && this.data.price && this.data.price.length > 0) {
      this.width = this.container.nativeElement.offsetWidth;
      this.getData();
      this.loadChart();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.data) {
      this.width = this.container.nativeElement.offsetWidth;
      this.loadChart();
    }
  }

  onScroll(event) {
    this.scrollLeft = event.srcElement.scrollLeft;
  }
}
