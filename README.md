# Figmadeliom

This tools is a cli program that help starting a project.

## Installation
```
yarn add https://github.com/ThibautZanca/figmadeliom.git
```
or
```
npm install -s https://github.com/ThibautZanca/figmadeliom.git
```


#configuration

add in your folder a config file .figmadeliom.json with Figma data :

```
{
  "figma_personal_token": "111111-a1a11a11-1a11-1111-1111-aaaa111a1111",
  "figma_file_key": "A1A1AAAaa1aAaaaaaAaAa1"
}
```

To get a personal token connect go to Account Settings in Figma App.
And create a token in "Personal access tokens" section.
/!\ You need to fill the input and hit "Enter".

To get you file key, visit project via a browser and copy key from url.
If you use the Desktop App, you can right click on tab to get the link.

Other parameters are available.
```
{
  "figma_personal_token": "",
  "figma_file_key": "",
  "figma_api_url": "https://api.figma.com/v1",
  "node_ids": {
      "icons": "2%3A200",
      "colors": "2%3A359",
      "fonts": "796%3A32"
  },
  "downloadDelay": "100",
  "outputIconsDir": "./out/icons",
  "outputSassFile": "./out/sass/_variables.scss",
  
  "outputHeadingFile": "./out/sass/_heading.scss",
  "outputTextsFile": "./out/sass/_texts.scss"
}
```

#Usage

## Icons
```
$ npx figmadeliom icons
```
This command will downloadicons as svg from Figma project base in folder defined in `outputIconsDir`

## Sass
```
$ npx figmadeliom sass
```
This command will generate a sass file with colors and gradients from Figma project

###Options:  
`--no-colors`  Do not add colors  
`--no-fonts`   Do not add fonts  
`-h, --help`   display help for command  

## Typography
```
$ npx figmadeliom typo
```
This command will generate a sass file for heading and texts from Figma project `outputHeadingFile` and `outputTextsFile` 

###Options
--no-texts    Do not create texts file  
--no-heading  Do not create heading file  
-h, --help    display help for command  
