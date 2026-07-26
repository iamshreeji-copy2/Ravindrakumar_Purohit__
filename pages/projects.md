---
title: Projects
display: Projects
description: Key research implementations, speech models, and engineering projects
wrapperClass: 'text-center'
art: dots
projects:
  Speech & Audio Processing:
    - name: 'FC-HiFiGAN & PPHiFi-TTS'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Phonetic preserved & fast converging audio synthesis models with batchwise normalization'
      icon: 'i-carbon-audio-console'
    - name: 'BAANI Punjabi Vocoder'
      link: 'https://github.com/iamshreeji-copy1'
      desc: '296M-Parameter neural vocoder for end-to-end Punjabi speech synthesis'
      icon: 'i-carbon-connection-signal'
    - name: 'Swar Vocoder'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Longformer and Speaker-Aware GAN Vocoders for low-resource Indic speech synthesis (Gujarati & Hindi)'
      icon: 'i-carbon-microphone'
    - name: 'Vaachika'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'GAN-Based Neural Vocoder tailored for Marathi Text-to-Speech synthesis'
      icon: 'i-carbon-audio-console'
    - name: 'MLADDC & GGMDDC'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Multi-lingual audio deepfake detection corpora and evaluation frameworks'
      icon: 'i-carbon-security'

  Machine Learning & Computer Vision:
    - name: 'Face-Mask Detector (YOLOv5)'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Real-time deep learning model detecting improper mask usage or unmasked human faces'
      icon: 'i-carbon-face-activated'
    - name: 'Custom Object Detection'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Transfer-learning-based real-time object detection architecture using YOLOv5, SSD, and RCNN'
      icon: 'i-carbon-object-storage'
    - name: 'NLP Language Identification'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'NLP algorithm to accurately identify language from text inputs'
      icon: 'i-carbon-translate'

  Web Applications & Distributed Systems:
    - name: 'Automated ML Data Pipeline'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Automated data pipeline using AWS Elastic Beanstalk, PHP, and Git for exploratory analysis'
      icon: 'i-carbon-cloud-data-ops'
    - name: 'Carefinder'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'B2C medicine delivery platform with price comparison engine across local pharmacies (ASP.NET MVC, MySQL)'
      icon: 'i-carbon-hospital'
    - name: 'NFT Marketplace & Blockchain'
      link: 'https://github.com/iamshreeji-copy1'
      desc: 'Solidity smart contracts for NFT marketplaces & study on blockchain edge-cloud resource allocation'
      icon: 'i-carbon-blockchain'
---

<!-- @layout-full-width -->
<ListProjects :projects="frontmatter.projects" />
