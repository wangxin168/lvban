Page({
  data: {
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    departure_arr: [],
    departure_time: [],
    // 自己的月份 用来比较
    zi_yue:[]
  },
  onLoad: function(options) {
    var that = this;
    
    // 后台传的日期数组
    that.setData({
      departure_arr: options.departure_time.split(',')
    })
    // console.log(that.data.departure_arr)
    for (var i = 0; i < that.data.departure_arr.length; i++) {
      var shijian = that.data.departure_arr[i]
      var time = shijian.split('-')
      var time2 = time.join('')
      // console.log(time2)
      that.data.departure_time.push(time2)
    }
    // 循环后台的月份
    for (var i = 0; i < that.data.departure_time.length; i++) {
      var shijian = that.data.departure_time[i]
      console.log(shijian.substring(4,6))
      that.data.zi_yue.push(shijian.substring(4, 6))
    }
    console.log(that.data.zi_yue)
    var hou_yue = that.data.zi_yue, x, min = hou_yue[0];
    // 拿到最小值
    for (x in hou_yue) {
      if (hou_yue[x] < min) {
        min = hou_yue[x];
      }
    }
    var mins=Number(min)
    that.setData({
      month: mins
    })
    let now = new Date();
    let year = now.getFullYear();
    // let month = now.getMonth() + 1;
    this.setData({
      year: year,
      // month: month,
      isToday: '' + year + mins + now.getDate()
    })
    console.log(min)
    this.dateInit();
  },
  dateInit: function(setYear, setMonth) {
    var that = this;
    //全部时间的月份都是按0~11基准，显示月份才+1
    var dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    // console.log(now)
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth(); //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay(); //目标月1号对应的星期
    console.log(startWeek)
    let dayNums = new Date(year, that.data.month, 0).getDate(); //获取目标月有多少天
    console.log(dayNums)
    let obj_shijian = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();

    }
    arrLen = startWeek + dayNums;
    // console.log(arrLen)
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        if (num < 10) {
          num = '0' + num
        }
        // var shi = month + 1;
        var shi = that.data.month;
        if (shi < 10) {
          shi = '0' + shi
        }
        // console.log(year)
        // console.log(shi)
        // console.log(num)
        obj_shijian = {
          isToday: '' + year + shi + num,
          dateNum: num,
          weight: 5
        }
      } else {
        obj_shijian = {};
      }
      dateArr[i] = obj_shijian;
      // console.log(obj_shijian)
    }
    
    that.setData({
      dateArr: dateArr
    })
    // console.log(that.data.dateArr)
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }

    var arr = that.data.departure_time
    var dateshu = that.data.dateArr
    var arr3 = [];
    for (var s in arr) {
      for (var x in dateshu) {
        if (arr[s] == dateshu[x].isToday) {
          arr3.push(arr[s]);
          var my_set = dateshu[x];
          if (my_set == undefined) {
            my_set = {
              is_be_agree: 1
            }
          } else {
            my_set.is_be_agree = 2
          };
        }
      }
    }
    that.setData({
      dateArr: that.data.dateArr
    })
    console.log(that.data.dateArr)
    console.log("相同的是：" + arr3);
  },
  /**
   * 上月切换
   */
  lastMonth: function() {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },

  /**
   * 下月切换
   */
  nextMonth: function() {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  lookHuoDong: function(e) {
    // console.log(e)
    var that = this;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    for (var i = 0; i < that.data.departure_time.length; i++) {
      console.log(e)
      if (e.currentTarget.dataset.time != that.data.departure_time[i]) {
        // console.log(222)
        // return;
      } else {

        // console.log(11)
        prevPage.setData({
          message: e.currentTarget.dataset.year + '-' + e.currentTarget.dataset.month + '-' + e.currentTarget.dataset.datenum,
        })
        wx.navigateBack({
          delta: 1,
        })
      }
    }
  }
})