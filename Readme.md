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

yarn water --subject "Water and Sewer Usage Report" \
 --to "email1@gmail.com,email2@pm.me" \
 --billing-start "11/16/2023" \
 --billing-date "12/19/2023" \
 --total 128.85 \
 --avg-per-day  2.08 \
 --days-of-occupancy 31 \
 --amount-due 64.43

```

### Manga downloader

```
yarn comics

```

#### Debugging

Add 

```
--debug

```