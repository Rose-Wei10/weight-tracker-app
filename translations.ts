export type Lang = 'en' | 'zh';

export const translations = {
  en: {
    weight: 'Weight',
    addWeight: 'Add Weight',
    save: 'Save',
    progress: 'Progress',
    goal: 'Goal',
    logout: 'Log out',
    history: 'History',
    week: 'Week',
    month: 'Month',
    latest: 'Latest',
    edit: 'Edit',
    delete: 'Delete',

    // messages
    alreadyLogged: 'You already logged weight today. Edit it instead.',

    // insights
    lost: 'You lost',
    gained: 'You gained',
    weeklyAvg: 'Weekly avg',
    daysTracked: 'days tracked',

    // misc
    placeHolder: 'Enter weight (e.g. 70.0)',
    toGoal: ' to goal',
    streak: 'Day Streak',
    keepGoing: 'Keep it going!',
    insights: 'Insights',
  },

  zh: {
    weight: '体重',
    addWeight: '记录体重',
    save: '保存',
    progress: '进度',
    goal: '目标',
    logout: '退出登录', 
    history: '记录',
    week: '周',
    month: '月',
    latest: '最新',
    edit: '编辑',
    delete: '删除',

    // messages
    alreadyLogged: '今天已经记录过体重，请编辑已有数据',

    // insights
    lost: '你减掉了',
    gained: '你增加了',
    weeklyAvg: '周平均',
    daysTracked: '天已记录天数',

    // misc
    placeHolder: '输入体重（例如 70.0)',
    toGoal: '距离目标',
    streak: '连续打卡',
    keepGoing: '继续坚持！',
    insights: '洞察',
  },
};