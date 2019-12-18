# vanilla-nodejs

## Description

The `app.js` script will do the following:

* Fetch unit and SP enhancement data from [Deathmax's datamine](https://github.com/BluuArc/bfmt-utilities/tree/master/examples/vanilla-browser).
* Select a random unit ID
* Display effect data for the given unit ID.

## Usage

1. Install dependencies with `npm install`.
2. Run with `npm run app` or `node app.js`.
3. You should see an output similar to the following in your console:

```
Fetching datamine data...
Selected random ID to display: 10144

[Effects for Smith Lord Galant]

Leader Skill: Intense Strobe
* {"damage% for spark":50,"passive id":"31"}

Brave Burst: Veldre Dish
* {"bb atk%":115,"effect delay time(ms)/frame":"0.0/0","proc id":"1","target area":"aoe","target type":"enemy"}
* {"effect delay time(ms)/frame":"0.0/0","proc id":"11","target area":"aoe","target type":"enemy","weaken%":55}
```
