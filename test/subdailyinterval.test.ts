import { RRule } from '../src'

describe('subdaily interval alignment', () => {
  it.each([
    {
      name: 'SECONDLY with BYMINUTE (#674)',
      options: { freq: RRule.SECONDLY, interval: 7, byminute: [0] },
      dtstart: '2026-10-01T08:00:00Z',
      from: '2026-10-01T09:00:00Z',
      to: '2026-10-01T09:00:15Z',
      expected: ['2026-10-01T09:00:05Z', '2026-10-01T09:00:12Z'],
    },
    {
      name: 'SECONDLY with BYHOUR',
      options: { freq: RRule.SECONDLY, interval: 7, byhour: [8, 10] },
      dtstart: '2026-10-01T08:59:56Z',
      from: '2026-10-01T10:00:00Z',
      to: '2026-10-01T10:00:15Z',
      expected: [
        '2026-10-01T10:00:01Z',
        '2026-10-01T10:00:08Z',
        '2026-10-01T10:00:15Z',
      ],
    },
    {
      name: 'combined clock filters across a year boundary',
      options: {
        freq: RRule.SECONDLY,
        interval: 7,
        byhour: [0, 23],
        byminute: [59],
        bysecond: [0, 5, 12],
      },
      dtstart: '2026-12-31T23:59:00Z',
      from: '2027-01-01T00:59:00Z',
      to: '2027-01-01T00:59:15Z',
      expected: ['2027-01-01T00:59:05Z', '2027-01-01T00:59:12Z'],
    },
    {
      name: 'SECONDLY with an interval greater than a minute',
      options: { freq: RRule.SECONDLY, interval: 61, byminute: [0] },
      dtstart: '2026-10-01T08:00:00Z',
      from: '2026-10-01T10:00:00Z',
      to: '2026-10-01T10:01:00Z',
      expected: ['2026-10-01T10:00:59Z'],
    },
    {
      name: 'MINUTELY with BYHOUR and nonzero seconds',
      options: { freq: RRule.MINUTELY, interval: 7, byhour: [8, 10] },
      dtstart: '2026-10-01T08:00:30Z',
      from: '2026-10-01T10:00:00Z',
      to: '2026-10-01T10:15:00Z',
      expected: ['2026-10-01T10:06:30Z', '2026-10-01T10:13:30Z'],
    },
    {
      name: 'SECONDLY after skipping excluded weekdays',
      options: {
        freq: RRule.SECONDLY,
        interval: 11,
        byminute: [0],
        byweekday: [RRule.TH],
      },
      dtstart: '2026-10-01T08:00:00Z',
      from: '2026-10-08T08:00:00Z',
      to: '2026-10-08T08:00:15Z',
      expected: ['2026-10-08T08:00:02Z', '2026-10-08T08:00:13Z'],
    },
  ])('$name', ({ options, dtstart, from, to, expected }) => {
    const rule = new RRule({ ...options, dtstart: new Date(dtstart) })
    const dates = expected.map((date) => new Date(date))

    expect(rule.between(new Date(from), new Date(to), true)).toEqual(dates)
    expect(rule.after(new Date(from), true)).toEqual(dates[0])
    expect(rule.before(new Date(to), true)).toEqual(dates[dates.length - 1])
  })

  it.each([
    { name: 'COUNT', options: { count: 3 } },
    { name: 'UNTIL', options: { until: new Date('2026-10-01T09:00:12Z') } },
  ])('applies $name to matching intervals', ({ options }) => {
    const rule = new RRule({
      freq: RRule.SECONDLY,
      interval: 7,
      dtstart: new Date('2026-10-01T08:00:56Z'),
      byminute: [0],
      ...options,
    })

    expect(rule.all()).toEqual([
      new Date('2026-10-01T08:00:56Z'),
      new Date('2026-10-01T09:00:05Z'),
      new Date('2026-10-01T09:00:12Z'),
    ])
  })

  it('preserves MINUTELY intervals greater than an hour across days', () => {
    const rule = new RRule({
      freq: RRule.MINUTELY,
      interval: 61,
      dtstart: new Date('2026-10-01T08:00:00Z'),
      byhour: [8, 10],
      count: 3,
    })

    expect(rule.all()).toEqual([
      new Date('2026-10-01T08:00:00Z'),
      new Date('2026-10-01T10:02:00Z'),
      new Date('2026-10-02T08:24:00Z'),
    ])
  })
})
