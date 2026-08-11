import React, { useEffect, useCallback } from 'react'
import FadeIn from '../../fade-in'
import Bar from '../bar'
import MoreLink from '../more-link'
import { numberShortFormatter } from '../../util/number-formatter'
import * as api from '../../api'
import LazyLoader from '../../components/lazy-loader'
import { referrersGoogleRoute } from '../../router'
import { useQueryContext } from '../../query-context'
import { PlausibleSite, useSiteContext } from '../../site-context'
import { Rocket01Icon } from '@hugeicons/core-free-icons'
import { DashboardIcon } from '../../components/dashboard-icon'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { buttonVariants } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'

interface SearchTerm {
  name: string
  visitors: number
}

type ErrorCode = 'not_configured' | 'unsupported_filters' | 'period_too_recent'

interface ErrorPayload {
  error_code: ErrorCode
  is_admin: boolean
}

function ErrorMessage({ code }: { code: ErrorCode }): JSX.Element {
  if (code === 'not_configured') {
    return <div>The site is not connected to Google Search Keywords</div>
  } else if (code === 'unsupported_filters') {
    return (
      <div>
        Unable to fetch keyword data from Search Console because it does not
        support the current set of filters
      </div>
    )
  } else if (code === 'period_too_recent') {
    return (
      <div>
        No search terms were found for this period. Please adjust or extend your
        time range. Check{' '}
        <a
          href="https://plausible.io/docs/google-search-console-integration#i-dont-see-google-search-query-data-in-my-dashboard"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          our documentation
        </a>{' '}
        for more details.
      </div>
    )
  } else {
    return <div>Unable to fetch keyword data from Search Console</div>
  }
}

function ConfigureSearchTermsCTA({
  site
}: {
  site: PlausibleSite
}): JSX.Element {
  return (
    <>
      <div>Configure the integration to view search terms</div>
      <a
        href={`/${encodeURIComponent(site.domain)}/settings/integrations`}
        className={`${buttonVariants({ size: 'sm' })} mt-4`}
      >
        Connect with Google
      </a>
    </>
  )
}

export function SearchTerms() {
  const site = useSiteContext()
  const { query } = useQueryContext()

  const [loading, setLoading] = React.useState(true)
  const [errorPayload, setErrorPayload] = React.useState<null | ErrorPayload>(
    null
  )
  const [searchTerms, setSearchTerms] = React.useState<null | SearchTerm[]>(
    null
  )
  const [visible, setVisible] = React.useState(false)

  const fetchSearchTerms = useCallback(() => {
    api
      .get(
        `/api/stats/${encodeURIComponent(site.domain)}/referrers/Google`,
        query
      )
      .then((res) => {
        setLoading(false)
        setSearchTerms(res.results)
        setErrorPayload(null)
      })
      .catch((error) => {
        setLoading(false)
        setSearchTerms(null)
        setErrorPayload(error.payload)
      })
  }, [query, site.domain])

  useEffect(() => {
    if (visible) {
      setLoading(true)
      setSearchTerms([])
      fetchSearchTerms()
    }
  }, [query, fetchSearchTerms, visible])

  const onVisible = () => {
    setVisible(true)
  }

  const renderList = () => {
    if (searchTerms && searchTerms.length > 0) {
      return (
        <React.Fragment>
          <div className="mt-3 mb-2 flex items-center justify-between text-xs font-bold tracking-wide text-muted-foreground">
            <span>Search term</span>
            <span>Visitors</span>
          </div>
          {searchTerms &&
            searchTerms.map((term: SearchTerm) => (
              <div
                className="flex items-center justify-between my-1 text-sm"
                key={term.name}
              >
                <Bar
                  count={term.visitors}
                  all={searchTerms}
                  bg="bg-chart-2/10"
                  maxWidthDeduction="4rem"
                >
                  <span className="relative z-9 flex break-all px-2 py-1.5 text-foreground">
                    <span className="md:truncate block">{term.name}</span>
                  </span>
                </Bar>
                <span className="font-medium text-foreground">
                  {numberShortFormatter(term.visitors)}
                </span>
              </div>
            ))}
          <MoreLink
            list={searchTerms}
            linkProps={{
              path: referrersGoogleRoute.path,
              search: (search: Record<string, unknown>) => search
            }}
            className="w-full mt-3"
            onClick={undefined}
          />
        </React.Fragment>
      )
    }
  }

  const renderNoDataYet = () => {
    if (searchTerms && searchTerms.length === 0) {
      return (
        <div className="text-center text-foreground">
          <div className="mx-auto mt-44 font-medium text-muted-foreground">
            No data yet
          </div>
        </div>
      )
    }
  }

  const renderError = () => {
    if (errorPayload) {
      const { is_admin, error_code } = errorPayload

      return (
        <div className="mt-20 text-sm">
          <Alert className="mx-auto max-w-md text-left">
            <DashboardIcon
              icon={Rocket01Icon}
              className="size-5 text-primary"
            />
            <AlertTitle>Search terms unavailable</AlertTitle>
            <AlertDescription>
              <ErrorMessage code={error_code} />
              {error_code === 'not_configured' && is_admin && (
                <ConfigureSearchTermsCTA site={site} />
              )}
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-bold text-foreground">Search Terms</h3>
      <div className="relative grow">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center">
            <Skeleton className="size-16 rounded-full" />
          </div>
        )}
        <FadeIn show={!loading} className="grow">
          <LazyLoader onVisible={onVisible}>
            {searchTerms && searchTerms.length > 0 && renderList()}
            {searchTerms && searchTerms.length === 0 && renderNoDataYet()}
            {errorPayload && renderError()}
          </LazyLoader>
        </FadeIn>
      </div>
    </div>
  )
}
