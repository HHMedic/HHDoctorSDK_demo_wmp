// components/realname-input/realname-input.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        type: String,
        label: String,
        maxlength: Number,
        placeholder: String,
        name: String,
        textValue: String
    },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {

        },
        hide: function () { },
        resize: function () { },
    },

    /**
     * 组件的初始数据
     */
    data: {
        credential: [
            { id: '11', name: '居民身份证' },
        ],
        idx: 0,//证件类型下标-默认身份证
        value: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindInput(e) {
            this.setData({value:e.detail.value})
            let data = { name: this.properties.name, value: this.data.value }
            this.triggerEvent('inputData', data)
        },
        bindInputClose() {
            this.setData({ value: '' })
            let data = { name: this.properties.name, value: '' }
            this.triggerEvent('inputBlur', data)
        },
        bindBlur(e) {
            this.setData({value:e.detail.value})
            let data = { name: this.properties.name, value: this.data.value }
            this.triggerEvent('inputBlur', data)
        },
        clearData() {
            this.setData({ value: '' })
        }

    }
})
