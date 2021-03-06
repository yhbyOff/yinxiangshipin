import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Dimensions } from 'react-native';
import HxfModal from './HxfModal';
import Iconfont from '../Iconfont';
import SafeText from '../Basic/SafeText';

class WriteModal extends Component {
    render() {
        const { modalName, visible, value, handleVisible, changeVaule, submit, placeholder } = this.props;
        return (
            <HxfModal
                visible={visible}
                handleVisible={handleVisible}
                header={<SafeText style={styles.modalHeader}>{modalName}</SafeText>}>
                <View>
                    <TextInput
                        words={false}
                        underlineColorAndroid="transparent"
                        selectionColor={Theme.themeColor}
                        style={styles.textInput}
                        autoFocus={true}
                        placeholder={placeholder}
                        placeholderText={Theme.tintFontColor}
                        onChangeText={changeVaule}
                        maxLength={18}
                        defaultValue={value + ''}
                    />
                    <View style={styles.modalFooter}>
                        <SafeText
                            style={[styles.modalFooterText, { marginLeft: 20, color: Theme.secondaryColor }]}
                            onPress={submit}>
                            确定
                        </SafeText>
                        <SafeText
                            style={[styles.modalFooterText, { color: Theme.subTextColor }]}
                            onPress={handleVisible}>
                            取消
                        </SafeText>
                    </View>
                </View>
            </HxfModal>
        );
    }
}

const styles = StyleSheet.create({
    modalHeader: {
        fontSize: font(19),
        fontWeight: '500',
        color: Theme.defaultTextColor,
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.subTextColor,
        fontSize: font(15),
        color: Theme.defaultTextColor,
        padding: 0,
        paddingBottom: 5,
    },
    modalFooter: {
        marginTop: 20,
        flexDirection: 'row-reverse',
    },
    modalFooterText: {
        fontSize: font(14),
        fontWeight: '500',
        color: Theme.defaultTextColor,
        padding: 10,
    },
});

export default WriteModal;
