export default ({ configuration, params = {} }) => {
    const baseUrl = configuration?.supportUrl || 'https://support.depay.com'

    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value)
        }
    })

    const queryString = queryParams.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
