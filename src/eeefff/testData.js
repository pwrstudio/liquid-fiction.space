//# replacing website elements with erosion elements is not working now
const TEST_1 = {
  config: {
    delay: 5,
    disabled: false
  },
  timeline: [
    {
      class: 'erosion erosion-text no-name-outsourcers-01',
      text: 'no-name outsourcers will be here in a short time',
      duration: 6000,
      type: 'showText',
      position: 'erosion',
      label: 'no-name-outsourcers-01'
    },
    {
      class: 'erosion erosion-text outsourcing-orgy',
      text: 'Outsourcing Orgy',
      duration: 2000,
      type: 'showText',
      position: 'erosion',
      label: 'outsourcing-orgy'
    }
  ]
}

// delayed events are broken, events with set delayed attribute are not being played now.
const TEST_2 = {
  config: {
    delay: 5,
    disabled: false
  },
  timeline: [
    {
      class: 'erosion erosion-text no-name-outsourcers-02-text',
      delayed: 13227,
      text: 'do not move and wait for them',
      duration: 13227,
      type: 'showText',
      position: 'absolute',
      label: 'no-name-outsourcers-02-text'
    },
    {
      subtitles_ru:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt',
      class: 'erosion erosion-video spinner-video',
      subtitles_en:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt',
      loop: true,
      url_mp4:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4',
      duration: 26454,
      type: 'showVideo',
      position: 'absolute',
      label: 'spinner-video'
    },
    {
      class: 'erosion erosion-text no-name-outsourcers-02-text',
      text: 'xxxxx',
      duration: 13227,
      type: 'showText',
      position: 'absolute',
      label: 'no-name-outsourcers-02-text'
    },
    {
      subtitles_ru:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt',
      class: 'erosion erosion-video spinner-video',
      subtitles_en:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt',
      loop: true,
      url_mp4:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4',
      duration: 26454,
      type: 'showVideo',
      position: 'absolute',
      label: 'spinner-video'
    }
  ]
}

// in this example of timeline events are shown separately when these events are packed in one assemblage :
const TEST_3 = {
  config: {
    delay: 5,
    disabled: false
  },
  timeline: [
    {
      class: 'erosion erosion-text no-name-outsourcers-01',
      text: 'no-name outsourcers will be here in a short time',
      duration: 6000,
      type: 'showText',
      position: 'absolute',
      label: 'no-name-outsourcers-01'
    },
    {
      class: 'erosion erosion-text outsourcing-orgy',
      text: 'Outsourcing Orgy',
      duration: 2000,
      type: 'showText',
      position: 'erosion',
      label: 'outsourcing-orgy'
    },
    {
      events: [
        {
          class: 'erosion erosion-text outsourcing-orgy',
          text: 'kfkfkOutsourcing Orgy',
          duration: 5000,
          type: 'showText',
          position: 'erosion',
          label: 'outsourcing-orgy'
        },
        {
          class: 'erosion erosion-text no-name-outsourcers-02-text',
          src: '/img/Rock.png',
          duration: 26454,
          type: 'showImage',
          position: 'absolute',
          label: 'no-name-outsourcers-02-text'
        },
        {
          subtitles_ru:
            'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt',
          class: 'erosion erosion-video spinner-video',
          subtitles_en:
            'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt',
          loop: true,
          url_mp4:
            'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4',
          duration: 26454,
          type: 'showVideo',
          position: 'absolute',
          label: 'spinner-video'
        }
      ],
      duration: 26454,
      type: 'assemblage',
      label: 'no-name-outsourcers-02'
    }
  ]
}

const TEST_4 = {
  config: {
    delay: 5,
    disabled: false
  },
  timeline: [
    {
      subtitles_ru:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt',
      class: 'erosion erosion-video spinner-video',
      subtitles_en:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt',
      loop: true,
      url_mp4:
        'https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4',
      duration: 26454,
      type: 'showVideo',
      position: 'absolute',
      label: 'spinner-video'
    }
  ]
}
