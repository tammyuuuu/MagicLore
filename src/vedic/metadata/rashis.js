export const RASHI_METADATA={
  Aries:{sanskritName:'Mesha',englishName:'Aries',chineseName:'白羊座',element:'Fire',modality:'Movable',ruler:'Mars',keywords:['启动','直接','行动'],basicQualities:['主动启动','直接推进','快速回应']},
  Taurus:{sanskritName:'Vrishabha',englishName:'Taurus',chineseName:'金牛座',element:'Earth',modality:'Fixed',ruler:'Venus',keywords:['稳定','积累','实际价值'],basicQualities:['稳定持续','重视保存','关注实际价值']},
  Gemini:{sanskritName:'Mithuna',englishName:'Gemini',chineseName:'双子座',element:'Air',modality:'Dual',ruler:'Mercury',keywords:['交流','连接','变化'],basicQualities:['交换信息','连接观点','灵活调整']},
  Cancer:{sanskritName:'Karka',englishName:'Cancer',chineseName:'巨蟹座',element:'Water',modality:'Movable',ruler:'Moon',keywords:['照顾','承载','感受'],basicQualities:['接收','保护','回应环境','随情境移动']},
  Leo:{sanskritName:'Simha',englishName:'Leo',chineseName:'狮子座',element:'Fire',modality:'Fixed',ruler:'Sun',keywords:['表达','中心','可见性'],basicQualities:['集中表达','保持中心','寻求清晰可见']},
  Virgo:{sanskritName:'Kanya',englishName:'Virgo',chineseName:'处女座',element:'Earth',modality:'Dual',ruler:'Mercury',keywords:['辨析','整理','服务'],basicQualities:['分析细节','整理改进','回应实际需要']},
  Libra:{sanskritName:'Tula',englishName:'Libra',chineseName:'天秤座',element:'Air',modality:'Movable',ruler:'Venus',keywords:['平衡','关系','协调'],basicQualities:['衡量双方','协调关系','寻求可持续交换']},
  Scorpio:{sanskritName:'Vrishchika',englishName:'Scorpio',chineseName:'天蝎座',element:'Water',modality:'Fixed',ruler:'Mars',keywords:['深入','转化','隐藏过程'],basicQualities:['深入处理','保持专注','面对隐藏变化']},
  Sagittarius:{sanskritName:'Dhanu',englishName:'Sagittarius',chineseName:'射手座',element:'Fire',modality:'Dual',ruler:'Jupiter',keywords:['探索','信念','扩展'],basicQualities:['扩展视野','寻找原则','向更远处探索']},
  Capricorn:{sanskritName:'Makara',englishName:'Capricorn',chineseName:'摩羯座',element:'Earth',modality:'Movable',ruler:'Saturn',keywords:['结构','责任','实现'],basicQualities:['建立结构','承担责任','逐步实现']},
  Aquarius:{sanskritName:'Kumbha',englishName:'Aquarius',chineseName:'水瓶座',element:'Air',modality:'Fixed',ruler:'Saturn',keywords:['系统','群体','长期结构'],basicQualities:['观察系统','连接群体','维持长期框架']},
  Pisces:{sanskritName:'Meena',englishName:'Pisces',chineseName:'双鱼座',element:'Water',modality:'Dual',ruler:'Jupiter',keywords:['融合','想象','释放'],basicQualities:['容纳多重经验','感受整体','松开固定边界']}
};
export const getRashiMetadata=name=>RASHI_METADATA[name];
