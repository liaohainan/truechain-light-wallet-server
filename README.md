
## 登录成功后所有请求需携带 `Token`

```
status(1已申请/2已通过/3已拒绝)
type(1个人/2组队)
node_type(1标准节点/2全节点)
```

| 说明| API| 参数说明|
| -- | -- | -- |
|组队排行| teamRank| node_type|
|节点排行| nodeRank|node_type |
|组队信息| teamInfo| type,address(队长地址)|
|获取申请状态| getMemberStatus| 暂无|
|获得true币数量| getTrueCoin| 暂无|
|被拒时的初始化状态| initStatus| 暂无|
|创建组队| createTeam| node_type type |
|写入个人信息| writeUserInfo| nickname(个人昵称) reason(申请理由) |
|投票| vote|vote_num(投票数量)|
|组队查看| getMemberList| team_address(队长地址)|
|加入组队请求| joinTeamRequest|address(队长地址) node_type|
|是否同意加入组队| isJoinTeam|status , user_address|
|获取组队成员信息| getTeamMember|team_address(队长地址)|
|获取申请队伍信息| getRequestTeamInfo|暂无|
|获取队长地址| getTeamAddress|暂无|
|搜索组队| searchTeam| search_value())|



```js
for (let i = 0; i < 100; i++) {
      // Mock.mock('@cname')
      // Mock.mock('@csentence')
      // Mock.mock('@float()')
      // Mock.mock({ "number|1-100": 100 })
      // Mock.mock({ "number|1-2": 100 })
      // const sql = `SELECT * from team WHERE  node_type=${node_type} AND is_eligibility=1 ORDER BY tickets DESC LIMIT 20`;
      const sql = `
        INSERT INTO team (
        nickname,
        declaration,
        tickets,
        type,
        node_type,
        address,
        is_eligibility,
        lock_num
      ) VALUES(
        '${Mock.mock('@cname')}',
        '${Mock.mock('@csentence')}',
        '${Mock.mock({ "number|1-100": 1000 }).number}',
        '${Mock.mock({ "number|1-2": 100 }).number}',
        '${Mock.mock({ "number|1-2": 100 }).number}',
        '${Mock.mock('@float()')}',
        '1',
        '${Mock.mock({ "number|1-100": 10000 }).number}'
      )`;
      await app.mysql.query(sql);
    }
```


**锁仓数量地址 => 315**

```
SELECT count(*) FROM `user`
WHERE
`user`.lock_num > 0
```


**以锁仓地址并且在上一次的发币范围内的总数量 => 143**

```sql
SELECT uns.address, uns.value 
FROM untreated_address  uns
INNER JOIN
`user`
ON user.address=uns.address
AND user.lock_num > 0

```

**锁仓的地址并且不再上一次发币地址的范围 =>  172**

```sql
SELECT count(user.address) FROM `user`
WHERE
`user`.address not in (
	(SELECT uns.address
	FROM untreated_address  uns
	INNER JOIN
	`user`
	ON user.address=uns.address
	AND user.lock_num > 0)
)
AND user.lock_num > 0

```

**查找锁仓用户数量 => 240**

```sql
SELECT count(*) FROM untreated_address
WHERE
is_exist > 0
```

总锁仓地址为 315
查找锁仓用户数量为 240

有 315 - 240 = 75 个新账户地址没有在 3000 个地址中找到对应地址.
