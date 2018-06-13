(function () {

  function extend(target, ...rest) {
    for (let i = 0; i < rest.length; i++) {
      let source = rest[i]
      for (let key in source) {
        target[key] = source[key]
      }
    }
    return target;
  }

  function getRect(el) {
    if (el instanceof window.SVGElement) {
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    } else {
      return {
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight
      }
    }
  }

  /**
   * 判断是否有类名
   * @param {DOM} ele 
   * @param {类名} className 
   */
  const hasClass = (ele, className) => {
    let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
    return reg.test(ele.className);
  };

  /**
   * 添加类名
   * @param {DOM} ele 
   * @param {类名} className 
   */
  const addClass = (ele, className) => {
    if (hasClass(ele, className)) {
      return;
    }

    let newClass = ele.className.split(" ");
    newClass.push(className);
    ele.className = newClass.join(" ");
  }

  /**
   * 移除类名
   * @param {DOM} ele 
   * @param {类名} className 
   */
  const removeClass = (ele, className) => {
    if (!hasClass(ele, className)) {
      return;
    }
    let reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
    ele.className = ele.className.replace(reg, "");
  }

  /**
   * 反转类名
   * @param {DOM} ele 
   * @param {类名} className 
   */
  const toggleClass = (ele, className) => {
    if (hasClass(ele, className)) {
      removeClass(ele, className);
    } else {
      addClass(ele, className);
    }
  }

  var DEFAULT_OPTIONS = {
    isOpen: false,
    // events: {},
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    isRendered: false
  };

  function DataPicker(ele, opt) {
    this.chooseDOM = typeof ele === 'string' ? document.querySelector(ele) : ele;
    var options = extend({}, DEFAULT_OPTIONS, opt);
    this.options = options;
    if (!this.chooseDOM) {
      return;
    }
    this.events = [];
    this.init(options);
  }

  /**
   * 获取year年month月的天数
   * @param {*} year 
   * @param {*} month 
   */
  DataPicker.prototype.getMonthData = function (year, month) {

    year = year || this.options.year || new Date().getFullYear();
    month = month || this.options.month || (new Date().getMonth() + 1);

    var ret = [];
    // 本月第一天
    var thisMonthFirstDate = new Date(year, month - 1, 1);
    var thisMonthFirstDay = thisMonthFirstDate.getDate();
    var thisMonthFirstWeekDay = thisMonthFirstDate.getDay();
    // if(thisMonthFirstWeekDay === 0) {   thisMonthFirstWeekDay = 7; } var
    // prevMonthDayCount = thisMonthFirstWeekDay; 本月最后一天
    var thisMonthLastDate = new Date(year, month, 0);
    var thisMonthLastDay = thisMonthLastDate.getDate();
    // 上一个月最后一天
    var prevMonthLastDate = new Date(year, month - 1, 0);
    var prevMonthLastDay = prevMonthLastDate.getDate();


    for (var i = 0; i < 6 * 7; i++) {
      var date = i + 1 - thisMonthFirstWeekDay;
      var showMonth = month;
      var showDate = date;
      var showYear = year;
      if (date <= 0) {
        // 上一个月
        showMonth = month - 1;
        showDate = prevMonthLastDay + date;
      } else if (date > thisMonthLastDay) {
        // 下一个月
        showMonth = month + 1;
        showDate = date - thisMonthLastDay;
      }
      // 上一年
      if (showMonth === 0) {
        showMonth = 12;
        showYear = year - 1;
      }
      // 下一年
      if (showMonth === 13) {
        showMonth = 1;
        showYear = year + 1;
      }

      ret.push({
        date: date,
        showMonth: showMonth,
        showDate: showDate,
        showYear: showYear,
        class: this.options.month == showMonth ? showDate == this.options.day ? "active" : "" : "light"
      });
    }

    this.monthData = ret;

    return {
      year: year,
      month: month >= 10 ? month : "0" + month,
      days: ret
    };
  }
  /**
   * 获取可选年的数组
   * @param {*} year 为索引为9的年份
   */
  DataPicker.prototype.getYearData = function(year) {
    year = year || this.options.year || (this.yearData && this.yearData[9].year) || new Date().getFullYear();
    var ret = [];
    for(var i=0; i<18; i++) {
      var showYear = year-9 + i;
      ret.push({
        year: showYear,
        class: showYear == year ? "active" : ""
      })
    }
    this.yearData = ret;
    return ret;
  }
  /**
   * 获取月份数组
   * @param {*} month 
   */
  DataPicker.prototype.getYearOfMonth = function(month) {
    var ret = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月"
    ];
    ret = ret.map(function(item, index) {
      var obj = {};
      obj.month = item;
      obj.class = index == month - 1 ? "active" : "";
      return obj;
    });
    this.month = ret;
    return ret;
  }
  /**
   * 渲染可选天数
   * @param {*} renderData 
   */
  DataPicker.prototype.renderDay = function (renderData) {
    var str = '';
    var showyear = null;
    var showmonth = null;
    var showday = null;
    var cls = null;
    var height = this.bodyStyle && parseInt((this.bodyStyle.height - 30)/6, 10) + "px" || "auto";
    for (var i = 0; i < 6; i++) {
      str += '<tr style="height:'+ height +'">';
      for (var j = 0; j < 7; j++) {
        showday = renderData.days[i * 7 + j].showDate;
        showmonth = renderData.days[i * 7 + j].showMonth;
        showyear = renderData.days[i * 7 + j].showYear;
        cls = renderData.days[i * 7 + j].class;
        // str += '<td data-time='+showyear+'-'+showmonth+'-'+showday+'>' + showday + '</td>';
        str += `<td class="${cls}" data-time="${showyear}-${showmonth>=10?showmonth:"0"+showmonth}-${showday>=10?showday:"0"+showday}"><span>${showday}</span></td>`;
      }
      str += '</tr>';
    }
    return str.trim();
  }
  /**
   * 渲染可选年份数组
   * @param {*} renderData 
   */
  DataPicker.prototype.renderYear = function(renderData) {
    var str = "";
    var item = null;
    var height = this.bodyStyle && parseInt((this.bodyStyle.height)/6, 10) + "px" || "auto";
    for(var i=0; i<6; i++) {
      str += '<tr style="height:'+ height +'">';
      for(var j=0; j<3; j++) {
        item = renderData[i * 3 + j];
        str += `<td class="${item.class}"><span>${item.year}</span></td>`;
      }
      str += '</tr>';
    }
    return str.trim();
  }
  /**
   * 渲染可选月份数组
   * @param {*} renderData 
   */
  DataPicker.prototype.renderMonth = function(renderData) {
    var str = "";
    var item = null;
    var height = this.bodyStyle && parseInt((this.bodyStyle.height)/4, 10) + "px" || "auto";
    for(var i=0; i<4; i++) {
      str += '<tr style="height:'+ height +'">';
      for(var j=0; j<3; j++) {
        item = renderData[i * 3 + j];
        str += `<td class="${item.class}" data-month="${i * 3 + j + 1}"><span>${item.month}</span></td>`;
      }
      str += '</tr>';
    }
    return str.trim();
  }
  /**
   * 渲染主体框架
   * @param {*} year 
   * @param {*} month 
   */
  DataPicker.prototype.renderUI = function (year, month) {
    var renderData = this.getMonthData(year, month);
    var fragment = document.createElement("div");
    this.wrapper = fragment;
    this.wrapperStyle = fragment.style;
    fragment.className = "ui-datapicker-wrapper";
    // this.setPosition();
    var str = this.renderDay(renderData);
    fragment.innerHTML = `<div class="ui-datapicker-header">
                            <div class="ui-datapicker-check-day">
                              <a href="javascript:" class="ui-datapicker-btn ui-datapicker-prev ui-datapicker-prev-month">&lt;</a>
                              <a href="javascript:" class="ui-datapicker-btn ui-datapicker-next ui-datapicker-next-month">&gt;</a>
                              <div class="ui-datapicker-curr ui-datapicker-curr-yearmonth"><span class="ui-datapicker-select-year">${renderData.year}年</span><span class="ui-datapicker-select-month">${renderData.month}月</span></div>
                            </div>
                            <div class="ui-datapicker-check-month ui-datapicker-hide">
                              <div class="ui-datapicker-curr ui-datapicker-curr-month"><span>${renderData.year}年</span></div>
                            </div>
                            <div class="ui-datapicker-check-year ui-datapicker-hide">
                              <a href="javascript:" class="ui-datapicker-btn ui-datapicker-prev ui-datapicker-prev-year">&lt;</a>
                              <a href="javascript:" class="ui-datapicker-btn ui-datapicker-next ui-datapicker-next-year">&gt;</a>
                              <div class="ui-datapicker-curr ui-datapicker-curr-year"><span>${renderData.year-9}年</span>-<span>${renderData.year+8}年</span></div>
                            </div>
                          </div>
                          <div class="ui-datapicker-body">
                            <div class="ui-datapicker-body-day">
                              <table>
                                <thead>
                                  <tr>
                                    <th>日</th>
                                    <th>一</th>
                                    <th>二</th>
                                    <th>三</th>
                                    <th>四</th>
                                    <th>五</th>
                                    <th>六</th>
                                  </tr>
                                </thead>
                                <tbody>${str}</tbody>
                              </table>
                            </div>
                            <div class="ui-datapicker-body-year ui-datapicker-hide">
                              <table>
                                <tbody>
                                </tbody>
                              </table>
                            </div>
                            <div class="ui-datapicker-body-month ui-datapicker-hide">
                              <table>
                                <tbody>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div class="ui-datapicker-footer">
                            <div class="ui-datapicker-footer-left">
                              <div class="ui-datapicker-select-time">选择时间</div>
                            </div>
                            <div class="ui-datapicker-footer-right">
                              <div class="ui-datapicker-select-clear">清空</div>
                              <div class="ui-datapicker-select-now">现在</div>
                              <div class="ui-datapicker-select-sure">确定</div>
                            </div>
                          </div>`;
    document.body.appendChild(fragment);
    this.DOM = {};
    this.DOM["datapickerCheckDayBody"] = this.wrapper.querySelector(".ui-datapicker-body-day tbody");
    this.DOM["datapickerCheckYearBody"] = this.wrapper.querySelector(".ui-datapicker-body-year tbody");
    this.DOM["datapickerCheckMonthBody"] = this.wrapper.querySelector(".ui-datapicker-body-month tbody");
    this.DOM["prevMonthBtn"] = this.wrapper.querySelector(".ui-datapicker-prev-month");
    this.DOM["nextMonthBtn"] = this.wrapper.querySelector(".ui-datapicker-next-month");
    this.DOM["showYearMonth"] = this.wrapper.querySelector(".ui-datapicker-curr-yearmonth");
    this.DOM["checkYearOrMonthDOM"] = this.wrapper.querySelector(".ui-datapicker-curr-yearmonth");
    this.DOM["showYearDOM"] = this.wrapper.querySelector(".ui-datapicker-curr-year");
    this.DOM["prevYearBtn"] = this.wrapper.querySelector(".ui-datapicker-prev-year");
    this.DOM["nextYearBtn"] = this.wrapper.querySelector(".ui-datapicker-next-year");
    this.DOM["showMonthDOM"] = this.wrapper.querySelector(".ui-datapicker-curr-month");
    this.bodyStyle = getRect(this.wrapper.querySelector(".ui-datapicker-body"));
  }

  DataPicker.prototype.changeDayUI = function (year, month) {
    var renderData = this.getMonthData(year, month);
    this.DOM["datapickerCheckDayBody"].innerHTML = this.renderDay(renderData);
    this.DOM["showYearMonth"].innerHTML = `<span class="ui-datapicker-select-year">${renderData.year}年</span><span class="ui-datapicker-select-month">${renderData.month}月</span>`;
  }

  DataPicker.prototype.changeYearUI = function(year) {
    var renderData = this.getYearData(year);
    this.DOM["datapickerCheckYearBody"].innerHTML = this.renderYear(renderData);
    this.DOM["showYearDOM"].innerHTML = `<span>${renderData[0].year}年</span>-<span>${renderData[renderData.length-1].year}年</span>`;
  }
  /**
   * 设置dataPicker位置
   */
  DataPicker.prototype.setPosition = function () {
    // console.log(this.wrapper.clientHeight);
    var chooseDOMRect = getRect(this.chooseDOM);
    this.wrapperStyle.left = `${chooseDOMRect.left + 5}px`;
    // this.wrapperStyle.top = `${chooseDOMRect.top + chooseDOMRect.height + 5}px`;
    // if(chooseDOMRect.bottom + this.wrapper.clientHeight <= document.body.clientHeight) {
    //   console.log(1)
    //   this.wrapperStyle.top = `${chooseDOMRect.top + chooseDOMRect.height + 5}px`;
    // }else {
    //   this.wrapperStyle.top = `${chooseDOMRect.top -this.wrapper.clientHeight- 5}px`;
    // }
    if (this.wrapper.clientHeight > document.body.clientHeight) {
      this.wrapperStyle.top = `${chooseDOMRect.top + chooseDOMRect.height + 5}px`;
    } else {
      this.wrapperStyle.top = `${chooseDOMRect.top -this.wrapper.clientHeight- 5}px`;
    }
  }
  
  DataPicker.prototype.prevYear = function(e) {
    e.stopPropagation();
    this.changeYearUI(this.yearData[9].year-18);
  }

  DataPicker.prototype.nextYear = function(e) {
    e.stopPropagation();
    this.changeYearUI(this.yearData[9].year+18);
  }

  DataPicker.prototype.prevMonth = function (e) {
    e.stopPropagation();
    // console.log(e);
    this.options.month = this.options.month - 1;
    if (this.options.month === 0) {
      this.options.month = 12;
      this.options.year = this.options.year - 1;
    }
    this.changeDayUI(this.options.year, this.options.month);
  }

  DataPicker.prototype.nextMonth = function (e) {
    e.stopPropagation();
    this.options.month = this.options.month + 1;
    if (this.options.month === 13) {
      this.options.month = 1;
      this.options.year = this.options.year + 1;
    }
    this.changeDayUI(this.options.year, this.options.month);
  }
  /**
   * 选择年份
   * @param {*} e 
   */
  DataPicker.prototype.selectYear = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target.tagName === "SPAN") {
      var tdDOM = this.DOM["datapickerCheckYearBody"].querySelectorAll("td");
      tdDOM.forEach(function (td) {
        td.classList.remove("active");
      });
      // console.log(target.parentNode);
      console.log(target);
      addClass(target.parentNode, "active");
      var year = parseInt(target.innerHTML, 10);
      this.getYearData(year);
      this.options.year = year;
      this.changeDayUI();
      addClass(this.DOM["showYearDOM"].parentNode, "ui-datapicker-hide");
      addClass(this.DOM["datapickerCheckYearBody"].parentNode.parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["showYearMonth"].parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["datapickerCheckDayBody"].parentNode.parentNode, "ui-datapicker-hide");
    }

  }
  /**
   * 选择月份
   * @param {*} e 
   */
  DataPicker.prototype.selectMonth = function(e) {
    
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target.tagName === "SPAN") {
      var tdDOM = this.DOM["datapickerCheckMonthBody"].querySelectorAll("td");
      tdDOM.forEach(function (td) {
        td.classList.remove("active");
      });
      // console.log(target.parentNode);
      console.log(target);
      addClass(target.parentNode, "active");
      var month = parseInt(target.parentNode.getAttribute("data-month"), 10);
      this.getYearOfMonth(month);
      this.options.month = month;
      this.changeDayUI();
      addClass(this.DOM["showMonthDOM"].parentNode, "ui-datapicker-hide");
      addClass(this.DOM["datapickerCheckMonthBody"].parentNode.parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["showYearMonth"].parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["datapickerCheckDayBody"].parentNode.parentNode, "ui-datapicker-hide");
    }

  }

  /**
   * 选择天
   * @param {*} e 
   */
  DataPicker.prototype.selectDay = function (e) {
    
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target.tagName === "SPAN") {
      var tdDOM = this.DOM["datapickerCheckDayBody"].querySelectorAll("td");
      tdDOM.forEach(function (td) {
        td.classList.remove("active");
      });
      // console.log(target.parentNode);
      // console.log(this);
      var date = target.parentNode.getAttribute("data-time");
      this.options.day = new Date(date).getDate();
      this.options.year = new Date(date).getFullYear();
      this.options.month = new Date(date).getMonth() + 1;
      target.parentNode.classList.add("active");
      if (this.chooseDOM.nodeName === "INPUT") {
        this.chooseDOM.value = date;
      } else {
        this.chooseDOM.innerHTML = date;
      }
      this.hide(e);
    }
    
    // this.removeEvent();
  }

  DataPicker.prototype.showCheckYear = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if(target.className.indexOf("ui-datapicker-select-year")==-1 && target.className.indexOf("ui-datapicker-select-month")==-1) {
      return;
    }
    var headerchildren = this.wrapper.querySelector(".ui-datapicker-header").children;
    var tbodychildren = this.wrapper.querySelector(".ui-datapicker-body").children;
    for(var i=0; i<headerchildren.length; i++) {
      var item = headerchildren[i];
      addClass(item, "ui-datapicker-hide");
    }
    for(var i=0; i<tbodychildren.length; i++) {
      var item = tbodychildren[i];
      addClass(item, "ui-datapicker-hide");
    }
    if(target.className.indexOf("ui-datapicker-select-year")!=-1) {
      console.log("选择年");
      removeClass(this.DOM["showYearDOM"].parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["datapickerCheckYearBody"].parentNode.parentNode, "ui-datapicker-hide");
      var yearData = this.getYearData(this.options.year);
      this.DOM["showYearDOM"].innerHTML = `<span>${yearData[0].year}年</span>-<span>${yearData[yearData.length-1].year}年</span>`;
      this.DOM["datapickerCheckYearBody"].innerHTML = this.renderYear(yearData);
    }
    if(target.className.indexOf("ui-datapicker-select-month")!=-1) {
      console.log("选择月");
      removeClass(this.DOM["showMonthDOM"].parentNode, "ui-datapicker-hide");
      removeClass(this.DOM["datapickerCheckMonthBody"].parentNode.parentNode, "ui-datapicker-hide");
      var month = this.getYearOfMonth(this.options.month);
      this.DOM["showMonthDOM"].innerHTML = `<span>${this.options.year}年</span>`;
      this.DOM["datapickerCheckMonthBody"].innerHTML = this.renderMonth(month);
    }
    
  }

  DataPicker.prototype.on = function (ele, type, fn, capture = false) {
    this.events.push({
      dom: ele,
      type: type,
      handle: fn,
      capture: capture
    });
    ele && ele.addEventListener(type, fn, {
      passive: false,
      capture: !!capture
    });
  }

  DataPicker.prototype.off = function (ele, type, fn, capture = false) {
    ele && ele.removeEventListener(type, fn, {
      passive: false,
      capture: !!capture
    });
  }

  DataPicker.prototype.addEvent = function () {
    var self = this;
    this.on(this.chooseDOM, "click", this.show.bind(self));
    this.on(document.body, "click", this.hide.bind(self));
    this.on(this.DOM["prevMonthBtn"], "click", this.prevMonth.bind(self));
    this.on(this.DOM["nextMonthBtn"], "click", this.nextMonth.bind(self));
    this.on(this.DOM["datapickerCheckDayBody"], "click", this.selectDay.bind(self));
    this.on(this.wrapper, "click", this.ignore.bind(self));
    this.on(this.DOM["checkYearOrMonthDOM"], "click", this.showCheckYear.bind(self));
    this.on(this.DOM["prevYearBtn"], "click", this.prevYear.bind(self));
    this.on(this.DOM["nextYearBtn"], "click", this.nextYear.bind(self));
    this.on(this.DOM["datapickerCheckYearBody"], "click", this.selectYear.bind(self));
    this.on(this.DOM["datapickerCheckMonthBody"], "click", this.selectMonth.bind(self));
  }

  DataPicker.prototype.removeEvent = function () {
    for (var i = 0; i < this.events.length; i++) {
      var event = this.events[i];
      this.off(event.dom, event.type, event.handle, event.capture);
    }
  }

  DataPicker.prototype.ignore = function(e) {
    e.stopPropagation();
  }

  DataPicker.prototype.showOrHide = function () {
    this.wrapper.classList.toggle("ui-datapicker-show");
    this.options.isOpen = !this.options.isOpen;
  }

  DataPicker.prototype.show = function (e) {
    e.stopPropagation();
    addClass(this.wrapper, "ui-datapicker-show");
    this.setPosition();
    this.bodyStyle = getRect(this.wrapper.querySelector(".ui-datapicker-body"));
  }

  DataPicker.prototype.hide = function (e) {
    // console.log(e);
    e.stopPropagation();
    removeClass(this.wrapper, "ui-datapicker-show");
  }

  DataPicker.prototype.init = function (options) {

    this.renderUI();
    this.addEvent();
    this.options.isRendered = true;
    
  }

  window.DataPicker = DataPicker;

})();