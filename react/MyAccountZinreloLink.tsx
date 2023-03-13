import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

const MyAccountZinreloLink = ({
  render,
  label,
}: {
  render: ([{ name, path }]: Array<{ name: string; path: string }>) => any
  label: string
}) => {
  const intl = useIntl()
  return render([
    {
      name: label ?? intl.formatMessage({ id: 'store/myaccount-menu' }),
      path: '/jeffers-rewards',
    },
  ])
}

MyAccountZinreloLink.propTypes = {
  render: PropTypes.func.isRequired,
  label: PropTypes.string,
}

export default MyAccountZinreloLink
