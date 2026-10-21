# 吠陀月宿、分足和 D9 如何从黄经计算？

先计算视地心热带黄经，再减去选定岁差并归一化到 `[0,360)`，得到恒星黄经 λ。出生时刻、星历、岁差和交点版本都应与结果一起保存。

## 本项目的模型

`vedic-geometry-v1` 使用 Astronomy Engine 2.1.19。默认岁差 `lahiri-j2000-iau2006-approx` 以 J2000 TT 平黄道 Lahiri 值23°51′25.5324″为基准，加 IAU 2006 总岁差多项式与当日黄经章动。它是一个可核对的近似模型，**不是精确 Swiss Ephemeris Lahiri**。自定义模式接受输入日期的真岁差值，不接受未注明历元的模糊数值。

罗睺、计都使用平均交点，相距180°；不声称使用真交点。上升点取地平与黄道的东方交点；整宫制第一宫是上升星座的完整30°，后续各宫依星座顺序排列，不混用其他宫制。高纬和分界处需复核。

## 均分规则

| 项目 | 计算 |
|---|---|
| 星座索引 | `floor(λ/30)`，从0起 |
| 月宿索引 | `floor(3λ/40)`，从0起；每宿13⅓° |
| 分足 | `floor(3λ/10) % 4 + 1`；每分足3⅓° |
| D9 星座索引 | `floor(normalize(9λ)/30)`，从0起 |

边界按原始浮点角度计算，不能先把13.333…显示成13.33再分类。例如0°进入 Ashwini，第13⅓°进入 Bharani。极接近分界的结果会受星历、岁差和出生记录误差影响。

D9在此仅表示分盘位置，不推出婚姻或人格结论。逆行采用前后六小时的黄经差估计日速度；近驻留设有阈值。出生时间误差只比较区间两端，不保证整个区间内分类相同。

## 原始资料

- [Astronomy Engine coordinate API](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md)
- [Swiss Ephemeris: Lahiri参考值、整宫制](https://www.astro.com/swisseph/swisseph.htm)
- [IAU / USNO Circular 179](https://aa.usno.navy.mil/downloads/Circular_179_bw.pdf)
- [Meeus平均月球交点多项式](https://pymeeus.readthedocs.io/en/latest/_modules/pymeeus/Moon.html)

这些资料用于核对天文学或数学步骤，不作为占星预测有效性的证据。

[实现源码](../src/vedic.js) · [在线基础盘](https://fateatlas.net/vedic?utm_source=github&utm_medium=referral&utm_campaign=calculations)
