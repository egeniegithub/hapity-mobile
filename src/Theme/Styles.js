import React from 'react';
import * as colors from '../Theme/Color';

const Styles = {
    alertStyle: {
        mask: {
            backgroundColor: "transparent"
          },
        container: {
            borderWidth: 0.5,
            borderColor: colors.colorDarkGray,
            shadowColor: "#000000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            borderRadius: 10
        },
        buttonConfirm: {
            backgroundColor: colors.colorPrimary
        },
        buttonCancel: {
            backgroundColor: "#e60000"
          },
    }
};

export default Styles;