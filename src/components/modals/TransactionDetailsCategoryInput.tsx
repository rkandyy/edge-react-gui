import * as React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'

import s from '../../locales/strings'
import { FormattedText } from '../../modules/UI/components/FormattedText/FormattedText.ui'
import { THEME } from '../../theme/variables/airbitz'
import { splitTransactionCategory } from '../../util/utils'
import { AirshipModal } from '../common/AirshipModal'
import { FormField, MaterialInputOnWhite } from '../common/FormField'
import { SubCategorySelect } from '../common/TransactionSubCategorySelect'

export type CategoryModalResult = {
  category: string
  subCategory: string
}

type CategoriesType = Array<{
  key: string
  syntax: string
}>

type Props = {
  bridge: AirshipBridge<CategoryModalResult | undefined>
  categories: object
  subCategories: string[]
  category: string
  subCategory: string
  setNewSubcategory: (input: string, subCategories: string[]) => void
}

type State = {
  categories: CategoriesType
  category: string
  subCategory: string
}

export class TransactionDetailsCategoryInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { category, subCategory } = props
    const categories = this.formattedCategories(props.categories)
    this.state = { categories, category, subCategory }
  }

  formattedCategories = (categories: object): CategoriesType => {
    return Object.keys(categories).map(key => {
      return {
        // @ts-expect-error
        key: categories[key].key,
        // @ts-expect-error
        syntax: categories[key].syntax
      }
    })
  }

  onChangeCategory = (category: string) => {
    this.setState({ category })
  }

  onChangeSubCategory = (subCategory: string) => {
    this.setState({ subCategory })
  }

  onSelectSubCategory = (input: string) => {
    const { bridge, subCategories, setNewSubcategory } = this.props
    const splittedFullCategory = splitTransactionCategory(input)
    const { subCategory } = splittedFullCategory
    const category = splittedFullCategory.category.toLowerCase()
    if (!subCategories.find(item => item === input)) {
      setNewSubcategory(input, subCategories)
    }
    bridge.resolve({ category, subCategory })
  }

  render() {
    const { bridge } = this.props
    const { categories, category, subCategory } = this.state
    return (
      <AirshipModal bridge={bridge} onCancel={() => bridge.resolve(undefined)}>
        <TouchableWithoutFeedback onPress={() => bridge.resolve(undefined)}>
          <View style={styles.airshipContainer}>
            <FormattedText style={styles.airshipHeader}>{s.strings.transaction_details_category_title}</FormattedText>
            <View style={styles.inputCategoryMainContainter}>
              <FormattedText style={styles.inputCategoryListHeader}>{s.strings.tx_detail_picker_title}</FormattedText>
              <View style={styles.inputCategoryRow}>
                {categories.map(item => {
                  const containterStyle = category === item.key ? styles.inputCategoryContainterSelected : styles.inputCategoryContainter
                  return (
                    <TouchableWithoutFeedback onPress={() => this.onChangeCategory(item.key)} key={item.key}>
                      <View style={containterStyle}>
                        <FormattedText style={styles.inputCategoryText}>{item.syntax}</FormattedText>
                      </View>
                    </TouchableWithoutFeedback>
                  )
                })}
              </View>
            </View>
            <View style={styles.inputSubCategoryContainter}>
              <FormField
                {...MaterialInputOnWhite}
                // @ts-expect-error
                containerStyle={{
                  ...MaterialInputOnWhite.containerStyle,
                  height: THEME.rem(3.44),
                  width: '100%'
                }}
                autoFocus
                returnKeyType="done"
                autoCapitalize="none"
                label={s.strings.transaction_details_choose_a_sub_category}
                fontSize={THEME.rem(0.9)}
                labelFontSize={THEME.rem(0.65)}
                onChangeText={this.onChangeSubCategory}
                onSubmitEditing={() => bridge.resolve({ category, subCategory })}
                value={subCategory}
              />
            </View>
            <SubCategorySelect
              bottomGap={0}
              onPressFxn={this.onSelectSubCategory}
              enteredSubcategory={subCategory}
              subcategoriesList={this.getSortedSubCategories()}
              categories={this.getSortedCategories()}
            />
          </View>
        </TouchableWithoutFeedback>
      </AirshipModal>
    )
  }

  getSortedCategories = (): string[] => {
    const { categories, category } = this.state
    const selectedCategories = categories.filter(item => item.key === category)
    const filteredCategories = categories.filter(item => item.key !== category)
    const sortedCategories = [...selectedCategories, ...filteredCategories]
    return sortedCategories.map(category => category.key)
  }

  getSortedSubCategories = () => {
    const { categories, subCategories } = this.props
    const { category } = this.state

    const selectedSubcategories = subCategories.filter(subCategory => {
      const splittedSubCategory = subCategory.split(':')
      // @ts-expect-error
      return splittedSubCategory[0].toLowerCase() === categories[category].syntax.toLowerCase()
    })
    const filteredSubcategories = subCategories.filter(subCategory => {
      const splittedSubCategory = subCategory.split(':')
      // @ts-expect-error
      return splittedSubCategory[0].toLowerCase() !== categories[category].syntax.toLowerCase()
    })
    return [...selectedSubcategories, ...filteredSubcategories]
  }
}

const styles = StyleSheet.create({
  airshipContainer: {
    flex: 1,
    padding: THEME.rem(0.8)
  },
  airshipHeader: {
    fontSize: THEME.rem(1.2),
    marginBottom: THEME.rem(1),
    alignSelf: 'center'
  },
  inputCategoryListHeader: {
    fontSize: THEME.rem(0.7),
    marginBottom: THEME.rem(0.3),
    color: THEME.COLORS.SECONDARY
  },
  inputCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputCategoryContainter: {
    paddingHorizontal: THEME.rem(0.5),
    paddingVertical: THEME.rem(0.2),
    marginRight: THEME.rem(0.6),
    borderWidth: 1,
    borderColor: THEME.COLORS.TRANSACTION_DETAILS_SECONDARY,
    borderRadius: 3
  },
  inputCategoryContainterSelected: {
    paddingHorizontal: THEME.rem(0.5),
    paddingVertical: THEME.rem(0.2),
    marginRight: THEME.rem(0.6),
    borderWidth: 1,
    borderRadius: 3,
    borderColor: THEME.COLORS.TRANSACTION_DETAILS_SECONDARY,
    backgroundColor: THEME.COLORS.TRANSACTION_DETAILS_SECONDARY
  },
  inputCategoryText: {
    color: THEME.COLORS.SECONDARY,
    fontSize: THEME.rem(0.9)
  },
  inputCategoryMainContainter: {
    marginBottom: THEME.rem(0.8)
  },
  inputSubCategoryContainter: {
    marginTop: THEME.rem(0.8)
  }
})
