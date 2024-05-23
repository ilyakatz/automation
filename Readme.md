# Automation

Scripts to automate various tasks

## Installation

```
yarn install
yarn add sharp --ignore-engines

```

Copy `sample.env` to `.env` and update the values


### Water billing

```
export EMAIL_TO=.....@pm.me
export DATE_START=3/21/2024
export DATE_END=4/29/2024
export TOTAL=181.44
export ADULTS=2
```

```
yarn water --subject "Water and Sewer Usage Report" \
 --to "$EMAIL_TO" \
 --billing-start "$DATE_START" \
 --billing-date "$DATE_END" \
 --total $TOTAL \
 --adults $ADULTS

### Manga downloader

```
yarn comics

```

#### Debugging

Add 

```
--debug

```