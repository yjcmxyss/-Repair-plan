

export const REGION_DATA = {
  amazon: {
    name: "亚马逊雨林",
    lat: -3.46,
    lng: -62.21,
    image: "area/亚马逊.jpg", 
    weather: { temp: "28°C", humidity: "88%", pressure: "1010hPa", rain: "12mm" },
    eco: { forestChange: "85%", speciesIndex: "94/100" },
   ecoRadar: [
      { subject: '森林覆盖', value: 80 },    // 原始 80%
      { subject: '年降水', value: 73 },      // 2200mm (以3000为100)
      { subject: '平均温度', value: 81 },      // 27°C (以摄氏度比例缩放)
      { subject: '保护区', value: 50 },      // 50%
      { subject: '人口密度', value: 10 }     // 10
    ],
    alerts: { fire: "高风险", weather: "正常", drought: "无" },
    chain: [
      { id: 1, label: "森林火灾", sub: "Forest Fires" },
      { id: 2, label: "固碳下降", sub: "Carbon Sink Loss" },
      { id: 3, label: "降雨减少", sub: "Rainfall Decline" },
      { id: 4, label: "物种灭绝", sub: "Species Extinction" },
    ],
    tempTrend: [
      { time: '2000', temp: 26.2 }, { time: '2005', temp: 26.5 },
      { time: '2010', temp: 26.8 }, { time: '2015', temp: 27.2 },
      { time: '2024', temp: 27.8 }
    ],
    ecoRisk: "Medium" ,
    tempDeviation: "+1.6°C",
    intro: "作为‘地球之肺’，亚马逊雨林拥有全球最大生物多样性，储存了约1500亿吨碳。当前主要面临过度采伐和气候变暖导致的森林火灾威胁。",
    shortAnalysis : `森林火灾削弱碳汇能力，进而减少降雨并破坏生态平衡，最终导致物种灭绝风险显著上升。
`
  },

  sahara: {
    name: "撒哈拉",
     lat: 23.42,
    lng: 25.66,
    image: "area/撒哈拉.jpg", 
    weather: { temp: "42°C", humidity: "12%", pressure: "1008hPa", rain: "0mm" },
    eco: { forestChange: "1%", speciesIndex: "12/100" },
    ecoRadar:[
    { subject: "森林覆盖", value: 1 },
    { subject: "年降水", value: 3 },
    { subject: "平均温度", value: 85 },
    { subject: "保护区", value: 20 },
    { subject: "人口密度", value: 5 }
  ],
    alerts: { fire: "低风险", weather: "沙尘暴预警", drought: "极度干旱" },
    chain: [
      { id: 1, label: "极端高温", sub: "Extreme Heat" },
      { id: 2, label: "水源枯竭", sub: "Water Scarcity" },
      { id: 3, label: "沙尘增加", sub: "Dust Storms" },
      { id: 4, label: "土地沙化", sub: "Desert Expansion" }
    ],
    tempTrend: [
      { time: '2000', temp: 27.5 }, { time: '2005', temp: 28.0 },
      { time: '2010', temp: 28.6 }, { time: '2015', temp: 29.3 },
      { time: '2024', temp: 30.2 }
    ],
    ecoRisk: "High" ,
    tempDeviation: "+2.7°C",
    intro: "世界最大沙漠，其沙尘跨越大洋为全球输送矿物质。目前正经历极端的荒漠化扩张，气候干旱度已达到近十年最高峰值。",
    shortAnalysis : `极端高温加剧水资源短缺，引发沙尘活动增强，最终推动土地持续沙化与生态退化。
`
  },

  greatBarrierReef: {
    name: "大堡礁",
     lat: -18.29,
    lng: 147.70,
    image: "area/大堡礁.jpg", 
    weather: { temp: "26°C", humidity: "78%", pressure: "1010hPa", rain: "2010mm" },
    eco: { forestChange: "5%", speciesIndex: "85/100" },
   ecoRadar:[
    { subject: "森林覆盖", value: 5 },
    { subject: "年降水", value: 40 },
    { subject: "平均温度", value: 75 },
    { subject: "保护区", value: 33 },
    { subject: "人口密度", value: 2 }
  ],
    alerts: { fire: "极低风险", weather: "热带气旋预警", drought: "无" },
    chain: [
      { id: 1, label: "海水升温", sub: "Ocean Warming" },
      { id: 2, label: "珊瑚白化", sub: "Coral Bleaching" },
      { id: 3, label: "生态崩溃", sub: "Ecosystem Collapse" },
      { id: 4, label: "渔业受损", sub: "Fishery Impact" }
    ],
    tempTrend: [
      { time: '2000', temp: 26.0 }, { time: '2005', temp: 26.3 },
      { time: '2010', temp: 26.7 }, { time: '2015', temp: 27.1 },
      { time: '2024', temp: 27.6 }
    ],
    ecoRisk: "High" ,
    tempDeviation: "+1.6°C",
    intro: "世界上最大的珊瑚礁群。由于海水温度上升，目前正处于大规模珊瑚白化预警中。它是海洋生物的摇篮，也是海洋健康的晴雨表。",
    shortAnalysis :`海水升温引发珊瑚白化，破坏海洋生态结构，最终影响渔业资源与人类生计。
`
  },

  svalbard: {
    name: "斯瓦尔巴群岛",
    lat: 78.22,
    lng: 15.65,
    image: "area/斯瓦尔巴.jpg", 
    weather: { temp: "-12°C", humidity: "65%", pressure: "1002hPa", rain: "400mm" },
    eco: { forestChange: "10%", speciesIndex: "20/100" },
    ecoRadar:[
    { subject: "森林覆盖", value: 10 },
    { subject: "年降水", value: 15 },
    { subject: "平均温度", value: 5 },
    { subject: "保护区", value: 65 },
    { subject: "人口密度", value: 1 }
  ],
    alerts: { fire: "无", weather: "暴风雪预警", drought: "无" },
    chain: [
      { id: 1, label: "气温上升", sub: "Rising Temperature", icon: "🌡️" },
      { id: 2, label: "冰川融化", sub: "Glacier Melt", icon: "🧊" },
      { id: 3, label: "海冰减少", sub: "Sea Ice Loss", icon: "🌊" },
      { id: 4, label: "捕猎困难", sub: "Hunting Difficulty", icon: "🐻‍❄️" },
      { id: 5, label: "生态崩溃", sub: "Ecosystem Collapse", icon: "💀" },
    ],
    tempTrend: [
      { time: '2000', temp: -8.5 }, { time: '2005', temp: -7.2 },
      { time: '2010', temp: -6.0 }, { time: '2015', temp: -4.8 },
      { time: '2024', temp: -3.2 }
    ],
    ecoRisk: "Low" ,
    tempDeviation: "+5.3°C",
    intro: "北极圈内的生命方舟，设有全球种子库。由于‘北极放大效应’，这里的升温速度是全球平均水平的4倍，冰川消融速度极快。",
     shortAnalysis :`气温上升导致冰川与海冰减少，顶级捕食者生存受限，最终可能引发生态系统整体崩溃。
`
  },

  borneo: {
    name: "婆罗洲",
      lat: 0.96,
    lng: 114.55,
    image: "area/婆罗洲.jpg", 
    weather: { temp: "31°C", humidity: "82%", pressure: "1009hPa", rain: "3100mm" },
    eco: { forestChange: "75%", speciesIndex: "92/100" },
    ecoRadar: [
    { subject: "森林覆盖", value: 70 },
    { subject: "年降水", value: 88 },
    { subject: "平均温度", value: 80 },
    { subject: "保护区", value: 35 },
    { subject: "人口密度", value: 50 }
  ],
    alerts: { fire: "中风险", weather: "持续降雨", drought: "无" },
    chain: [
      { id: 1, label: "棕榈油扩张", sub: "Palm Oil Expansion", icon: "🌴" },
      { id: 2, label: "森林砍伐", sub: "Deforestation", icon: "🪓" },
      { id: 3, label: "栖息地丧失", sub: "Habitat Loss", icon: "🌳" },
      { id: 4, label: "物种减少", sub: "Biodiversity Decline", icon: "🦧" },
      { id: 5, label: "生态退化", sub: "Ecosystem Degradation", icon: "⚠️" }
    ],
    tempTrend: [
      { time: '2000', temp: 26.5 }, { time: '2005', temp: 26.8 },
      { time: '2010', temp: 27.1 }, { time: '2015', temp: 27.5 },
      { time: '2024', temp: 28.0 }
    ],
    ecoRisk: "High" ,
    tempDeviation: "+1.5°C",
    intro: "亚洲热带雨林的核心。这里是红毛猩猩的最后家园。当前生态系统正因棕榈油种植业的扩张而支离破碎，森林连通性大幅下降。",
     shortAnalysis :`棕榈油种植扩张推动森林砍伐，导致栖息地丧失与物种减少，最终引发生态系统整体退化。
`
  },

  galapagos: {
    name: "加拉帕戈斯群岛",
    lat: -0.95,
    lng: -90.97,
    image: "area/加拉帕戈斯.jpg", 
    weather: { temp: "24°C", humidity: "72%", pressure: "1013hPa", rain: "550mm" },
    eco: { forestChange: "20%", speciesIndex: "88/100" },
    ecoRadar: [
    { subject: "森林覆盖", value: 20 },
    { subject: "年降水", value: 20 },
    { subject: "平均温度", value: 68 },
    { subject: "保护区", value: 97 },
    { subject: "人口密度", value: 10 }
  ],
    alerts: { fire: "低风险", weather: "正常", drought: "季节性干旱" },
    chain: [
      { id: 1, label: "棕榈油扩张", sub: "Palm Oil Expansion", icon: "🌴" },
      { id: 2, label: "森林砍伐", sub: "Deforestation", icon: "🪓" },
      { id: 3, label: "栖息地丧失", sub: "Habitat Loss", icon: "🌳" },
      { id: 4, label: "物种减少", sub: "Biodiversity Decline", icon: "🦧" },
      { id: 5, label: "生态退化", sub: "Ecosystem Degradation", icon: "⚠️" }
    ],
    tempTrend: [
      { time: '2000', temp: 23.5 }, { time: '2005', temp: 23.8 },
      { time: '2010', temp: 24.2 }, { time: '2015', temp: 24.6 },
      { time: '2024', temp: 25.1 }
    ],
    ecoRisk: "Medium" ,
    tempDeviation: "+1.6°C",
    intro: "达尔文进化论的启蒙地。拥有众多独有物种如象龟。当前面临厄尔尼诺现象引发的洋流改变和外来入侵物种的生态排挤。",
     shortAnalysis : `气温上升加速冰川退缩，削弱区域水源供给，进而对生态系统与人类生存造成持续压力。
`
  },

  himalayas: {
    name: "喜马拉雅山脉",
    lat: 27.98,
    lng: 86.92,
    image: "area/喜马拉雅.jpg", 
    weather: { temp: "-22°C", humidity: "30%", pressure: "600hPa", rain: "1200mm" },
    eco: { forestChange: "35%", speciesIndex: "75/100" },
    ecoRadar: [
    { subject: "森林覆盖", value: 35 },
    { subject: "年降水", value: 45 },
    { subject: "平均温度", value: 30 },
    { subject: "保护区", value: 25 },
    { subject: "人口密度", value: 15 }
  ],
    alerts: { fire: "无", weather: "雪崩预警", drought: "冰川消融" },
    chain: [
      { id: 1, label: "气温上升", sub: "Rising Temperature", icon: "🌡️" },
      { id: 2, label: "冰川退缩", sub: "Glacier Retreat", icon: "🧊" },
      { id: 3, label: "水源减少", sub: "Water Supply Decline", icon: "💧" },
      { id: 4, label: "生态系统受损", sub: "Ecosystem Stress", icon: "🌿" },
      { id: 5, label: "人类生存压力", sub: "Human Risk", icon: "⚠️" }
    ],
    tempTrend: [
      { time: '2000', temp: -2.0 }, { time: '2005', temp: -1.5 },
      { time: '2010', temp: -1.0 }, { time: '2015', temp: -0.3 },
      { time: '2024', temp: 0.8 }
    ],
    ecoRisk: "Medium" ,
    tempDeviation: "+2.8°C",
    intro: "‘亚洲水塔’，支撑着下游数亿人口的水源。冰川融化正在加剧，不仅威胁供水安全，还可能引发大规模的冰湖溃决洪水。",
     shortAnalysis :`森林砍伐导致栖息地消失，特有物种数量快速下降，最终可能引发生物灭绝与生态系统脆弱化。
`
  },

  madagascar: {
    name: "马达加斯加",
    lat: -18.77,
    lng: 46.87,
    image: "area/马达加斯加.jpg", 
    weather: { temp: "25°C", humidity: "75%", pressure: "1011hPa", rain: "1500mm" },
    eco: { forestChange: "40%", speciesIndex: "95/100" },
   ecoRadar:  [
    { subject: "森林覆盖", value: 40 },
    { subject: "年降水", value: 55 },
    { subject: "平均温度", value: 70 },
    { subject: "保护区", value: 30 },
    { subject: "人口密度", value: 45 }
  ],
    alerts: { fire: "极高风险", weather: "气旋警报", drought: "严重干旱" },
    chain: [
      { id: 1, label: "森林砍伐", sub: "Deforestation", icon: "🌴" },
      { id: 2, label: "栖息地丧失", sub: "Habitat Loss", icon: "🌳" },
      { id: 3, label: "特有物种减少", sub: "Endemic Species Decline", icon: "🦎" },
      { id: 4, label: "物种灭绝", sub: "Extinction", icon: "☠️" },
      { id: 5, label: "生态系统脆弱化", sub: "Ecosystem Fragility", icon: "⚠️" }
    ],
    tempTrend: [
      { time: '2000', temp: 24.8 }, { time: '2005', temp: 25.1 },
      { time: '2010', temp: 25.5 }, { time: '2015', temp: 26.0 },
      { time: '2024', temp: 26.6 }
    ],
    ecoRisk: "High" ,
    tempDeviation: "+1.8°C",
    intro: "亿万年孤立演化的奇迹，90%的动植物为当地特有。由于农业焚林，其核心原始森林已流失约80%，生态系统极度脆弱。",
     shortAnalysis :`非法砍伐加剧森林减少，破坏物种栖息环境，导致生物多样性下降并削弱生态系统稳定性。
`
  },

  antarctica: {
    name: "南极半岛",
    lat: -82.86,
    lng: 135.00,
    image: "area/南极洲.jpg", 
    weather: { temp: "-35°C", humidity: "20%", pressure: "990hPa", rain: "150mm" },
    eco: { forestChange: "0%", speciesIndex: "15/100" },
    ecoRadar: [
  { subject: "森林覆盖", value: 0 },
  { subject: "年降水", value: 5 },
  { subject: "平均温", value: 0 },
  { subject: "保护区", value: 10 },
  { subject: "人口密度", value: 0 }
],
    alerts: { fire: "无", weather: "极地气旋", drought: "无" },
    chain: [
      { id: 1, label: "气温上升", sub: "Temperature Rise", icon: "🌡️" },
      { id: 2, label: "冰架崩塌", sub: "Ice Shelf Collapse", icon: "🧊" },
      { id: 3, label: "海平面上升", sub: "Sea Level Rise", icon: "🌊" },
      { id: 4, label: "海洋生态变化", sub: "Marine Ecosystem Shift", icon: "🐧" },
      { id: 5, label: "全球影响扩大", sub: "Global Impact", icon: "🌍" }
    ],
    tempTrend: [
      { time: '2000', temp: -12.0 }, { time: '2005', temp: -11.0 },
      { time: '2010', temp: -10.2 }, { time: '2015', temp: -9.5 },
      { time: '2024', temp: -8.0 }
    ],
    ecoRisk: "Low" ,
    tempDeviation: "+4.0°C",
    intro: "地球最后的净土，储存了全球70%的淡水。冰架的持续崩塌预示着海平面上升的长期威胁，海洋食物链（如磷虾）正发生结构性改变。",
    shortAnalysis : `
气温上升引发冰架崩塌，进而导致海平面上升，并改变海洋生态系统结构，
最终对全球生态与人类社会产生连锁影响。
`
  },

  congoBasin: {
    name: "刚果盆地",
    lat: -2.88,
    lng: 23.65,
    image: "area/刚果盆地.jpg", 
    weather: { temp: "26°C", humidity: "90%", pressure: "1010hPa", rain: "2000mm" },
    eco: { forestChange: "80%%", speciesIndex: "94/100" },
   ecoRadar:[
    { subject: "森林覆盖", value: 75 },
    { subject: "年降水", value: 67 },
    { subject: "平均温度", value: 78 },
    { subject: "保护区", value: 40 },
    { subject: "人口密度", value: 20 }
  ],
    alerts: { fire: "中风险", weather: "强降雨", drought: "无" },
    chain: [
      { id: 1, label: "非法砍伐", sub: "Illegal Logging", icon: "🪓" },
      { id: 2, label: "森林减少", sub: "Forest Loss", icon: "🌲" },
      { id: 3, label: "物种栖息地受损", sub: "Habitat Damage", icon: "🦍" },
      { id: 4, label: "生物多样性下降", sub: "Biodiversity Decline", icon: "🐾" },
      { id: 5, label: "生态系统弱化", sub: "Ecosystem Weakening", icon: "⚠️" }
    ],
    tempTrend: [
  { time: '2000', temp: 27.1 }, { time: '2005', temp: 27.4 },
  { time: '2010', temp: 27.7 }, { time: '2015', temp: 28.1 },
  { time: '2024', temp: 28.6 }
],
ecoRisk: "Medium" ,
 tempDeviation: "+1.6°C",
    intro: "全球第二大热带雨林，拥有极深厚的泥炭地碳库。它是减缓全球变暖的关键，但目前面临非法木材采伐和基础设施建设的侵蚀。",
     shortAnalysis :`该过程属于典型的人类活动驱动型生态连锁反应，初始干扰通过栖息地与物种层层传导，最终导致生态系统稳定性下降。`
  }
};