import React, { ReactNode, useCallback, useState } from 'react'
import ModalWithRouting from '../stats/modals/modal'
import {
  canRemoveFilter,
  getSearchToRemoveSegmentFilter,
  canExpandSegment,
  SavedSegment,
  SEGMENT_TYPE_LABELS,
  SegmentData,
  SegmentType
} from '../filtering/segments'
import {
  AppNavigationLink,
  useAppNavigate
} from '../navigation/use-app-navigate'
import { plainFilterText, styledFilterText } from '../util/filter-text'
import { rootRoute } from '../router'
import { FilterPillsList } from '../nav-menu/filter-pills-list'
import classNames from 'classnames'
import { SegmentAuthorship } from './segment-authorship'
import { Alert02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { MutationStatus, useQuery } from '@tanstack/react-query'
import { ApiError, get } from '../api'
import { ErrorPanel } from '../components/error-panel'
import { useSegmentsContext } from '../filtering/segments-context'
import { Role, UserContextValue, useUserContext } from '../user-context'
import { removeFilterButtonClassname } from '../components/remove-filter-button'
import { useSiteContext } from '../site-context'
import { DashboardIcon } from '../components/dashboard-icon'
import { Button, buttonVariants } from '../components/ui/button'
import { Checkbox as ShadcnCheckbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Separator } from '../components/ui/separator'

interface ApiRequestProps {
  status: MutationStatus
  error?: unknown
  reset: () => void
}

interface SegmentModalProps {
  user: UserContextValue
  siteSegmentsAvailable: boolean
  onClose: () => void
  namePlaceholder: string
}

const primaryNeutralButtonClassName = buttonVariants()

const SegmentActionModal = ({
  children,
  onClose
}: {
  children: ReactNode
  onClose: () => void
}) => {
  return (
    <ModalWithRouting
      maxWidth="460px"
      className="p-6 min-h-fit"
      onClose={onClose}
    >
      <div className="mb-8 text-foreground">{children}</div>
    </ModalWithRouting>
  )
}

export const CreateSegmentModal = ({
  segment,
  onClose,
  onSave,
  siteSegmentsAvailable: siteSegmentsAvailable,
  user,
  namePlaceholder,
  error,
  reset,
  status
}: SegmentModalProps &
  ApiRequestProps & {
    segment?: SavedSegment
    onSave: (input: Pick<SavedSegment, 'name' | 'type'>) => void
  }) => {
  const defaultName = segment?.name
    ? `Copy of ${segment.name}`.slice(0, 255)
    : ''
  const [name, setName] = useState(defaultName)
  const defaultType =
    segment?.type === SegmentType.site &&
    siteSegmentsAvailable &&
    hasSiteSegmentPermission(user)
      ? SegmentType.site
      : SegmentType.personal

  const [type, setType] = useState<SegmentType>(defaultType)

  const { disabled, disabledMessage, onSegmentTypeChange } =
    useSegmentTypeDisabledState({
      siteSegmentsAvailable,
      user,
      setType
    })

  return (
    <SegmentActionModal onClose={onClose}>
      <FormTitle className="mb-8">Create segment</FormTitle>
      <SegmentNameInput
        value={name}
        onChange={setName}
        namePlaceholder={namePlaceholder}
      />
      <SegmentTypeSelector value={type} onChange={onSegmentTypeChange} />
      {disabled && <SegmentTypeDisabledMessage message={disabledMessage} />}
      <ButtonsRow>
        <SaveSegmentButton
          disabled={status === 'pending' || disabled}
          onSave={() => {
            const trimmedName = name.trim()
            const saveableName = trimmedName.length
              ? trimmedName
              : namePlaceholder
            onSave({ name: saveableName, type })
          }}
        />
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ButtonsRow>
      {error !== null && (
        <ErrorPanel
          className="mt-4"
          errorMessage={
            error instanceof ApiError
              ? error.message
              : 'Something went wrong creating segment'
          }
          onClose={reset}
        />
      )}
    </SegmentActionModal>
  )
}

function getLinksDeleteNotice(links: string[]) {
  return links.length === 1
    ? 'This segment is used in a shared link. To delete it, you also need to delete the shared link.'
    : `This segment is used in ${links.length} shared links. To delete it, you also need to delete the shared links.`
}

export const DeleteSegmentModal = ({
  onClose,
  onSave,
  segment,
  status,
  error,
  reset
}: {
  onClose: () => void
  onSave: (input: Pick<SavedSegment, 'id'>) => void
  segment: SavedSegment & { segment_data?: SegmentData }
} & ApiRequestProps) => {
  const site = useSiteContext()
  const [confirmed, setConfirmed] = useState(false)

  const linksQuery = useQuery({
    queryKey: [segment.id],
    queryFn: async () => {
      const response: string[] = await get(
        `/api/${encodeURIComponent(site.domain)}/segments/${segment.id}/shared-links`
      )
      return response
    }
  })

  const deleteDisabled =
    status === 'pending' ||
    linksQuery.status !== 'success' ||
    (!!linksQuery.data?.length && !confirmed)

  return (
    <SegmentActionModal onClose={onClose}>
      <FormTitle className="mb-4">
        Delete {SEGMENT_TYPE_LABELS[segment.type].toLowerCase()}
        <span className="break-all">{` "${segment.name}"?`}</span>
      </FormTitle>
      {linksQuery.status === 'pending' && (
        <DashboardIcon
          icon={Loading03Icon}
          className="size-4 animate-spin text-muted-foreground"
        />
      )}
      {linksQuery.status === 'success' && !!linksQuery.data?.length && (
        <ErrorPanel
          errorMessage={
            <span className="break-normal">
              {getLinksDeleteNotice(linksQuery.data)}
            </span>
          }
        />
      )}
      {linksQuery.status === 'error' && (
        <ErrorPanel
          errorMessage="Error loading related shared links"
          onRetry={linksQuery.refetch}
        />
      )}
      {!!segment.segment_data && (
        <div className="mt-4">
          <FiltersInSegment segment_data={segment.segment_data} />
        </div>
      )}
      {!!linksQuery.data?.length && (
        <>
          <div className="mt-4">
            <RelatedSharedLinks sharedLinks={linksQuery.data} />
          </div>
          <div className="mt-4">
            <Checkbox id="confirm" checked={confirmed} onChange={setConfirmed}>
              Yes, delete the associated shared links
            </Checkbox>
          </div>
        </>
      )}
      <ButtonsRow>
        <Button
          variant="destructive"
          disabled={deleteDisabled}
          onClick={
            deleteDisabled
              ? () => {}
              : () => {
                  onSave({ id: segment.id })
                }
          }
        >
          Delete
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ButtonsRow>
      {error !== null && (
        <ErrorPanel
          className="mt-4"
          errorMessage={
            error instanceof ApiError
              ? error.message
              : 'Something went wrong deleting segment'
          }
          onClose={reset}
        />
      )}
    </SegmentActionModal>
  )
}

const RelatedSharedLinks = ({ sharedLinks }: { sharedLinks: string[] }) => {
  return (
    <>
      <SecondaryTitle>Shared links</SecondaryTitle>
      <div className="mt-2">
        <FilterPillsList
          className="flex-wrap"
          direction="horizontal"
          pills={sharedLinks.map((name) => ({
            className: 'dark:!shadow-black/60',
            plainText: name,
            children: name,
            interactive: false
          }))}
        />
      </div>
    </>
  )
}

const FormTitle = ({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) => (
  <h1
    className={classNames(
      'font-heading text-lg font-medium leading-7 text-foreground',
      className
    )}
  >
    {children}
  </h1>
)

const ButtonsRow = ({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) => (
  <div className={classNames('mt-8 flex gap-x-3 items-center', className)}>
    {children}
  </div>
)

const SegmentNameInput = ({
  namePlaceholder,
  value,
  onChange
}: {
  namePlaceholder: string
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <>
      <Label htmlFor="name" className="mb-1.5 block">
        Segment name
      </Label>
      <Input
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={namePlaceholder}
        id="name"
        className="w-full"
      />
    </>
  )
}

const SegmentTypeSelector = ({
  value,
  onChange
}: {
  value: SegmentType
  onChange: (value: SegmentType) => void
}) => {
  const options = [
    {
      type: SegmentType.personal,
      name: SEGMENT_TYPE_LABELS[SegmentType.personal],
      description: 'Visible only to you'
    },
    {
      type: SegmentType.site,
      name: SEGMENT_TYPE_LABELS[SegmentType.site],
      description: 'Visible to others on the site'
    }
  ]

  return (
    <RadioGroup
      className="mt-6 gap-4"
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as SegmentType)}
    >
      {options.map(({ type, name, description }) => (
        <div key={type} className="flex items-start gap-3">
          <RadioGroupItem
            id={`segment-type-${type}`}
            value={type}
            className="mt-0.5"
          />
          <Label
            htmlFor={`segment-type-${type}`}
            className="flex flex-col items-start gap-1"
          >
            <div>{name}</div>
            <div className="text-sm font-normal text-muted-foreground">
              {description}
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

const useSegmentTypeDisabledState = ({
  siteSegmentsAvailable,
  user,
  setType
}: {
  siteSegmentsAvailable: boolean
  user: UserContextValue
  setType: (type: SegmentType) => void
}) => {
  const [disabled, setDisabled] = useState<boolean>(false)
  const [disabledMessage, setDisabledMessage] = useState<ReactNode | null>(null)

  const userIsOwner = user.role === Role.owner
  const canSelectSiteSegment = hasSiteSegmentPermission(user)

  const onSegmentTypeChange = useCallback(
    (type: SegmentType) => {
      setType(type)

      if (type === SegmentType.site && !canSelectSiteSegment) {
        setDisabled(true)
        setDisabledMessage(
          <>
            {"You don't have enough permissions to change segment to this type"}
          </>
        )
      } else if (type === SegmentType.site && !siteSegmentsAvailable) {
        setDisabled(true)
        setDisabledMessage(
          <>
            To use this segment type,&#32;
            {userIsOwner ? (
              <a href="/billing/choose-plan" className="underline">
                please upgrade your subscription
              </a>
            ) : (
              <>
                please reach out to a team owner to upgrade their subscription.
              </>
            )}
          </>
        )
      } else {
        setDisabled(false)
        setDisabledMessage(null)
      }
    },
    [setType, siteSegmentsAvailable, userIsOwner, canSelectSiteSegment]
  )

  return {
    disabled,
    disabledMessage,
    onSegmentTypeChange
  }
}

const SaveSegmentButton = ({
  disabled,
  onSave
}: {
  disabled: boolean
  onSave: () => void
}) => {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={disabled ? () => {} : onSave}
    >
      Save
    </Button>
  )
}

const SegmentTypeDisabledMessage = ({
  message
}: {
  message: ReactNode | null
}) => {
  if (!message) return null

  return (
    <div className="mt-2 flex gap-x-2 text-sm text-muted-foreground">
      <DashboardIcon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
      <div>{message}</div>
    </div>
  )
}

export const UpdateSegmentModal = ({
  onClose,
  onSave,
  segment,
  siteSegmentsAvailable,
  user,
  namePlaceholder,
  status,
  error,
  reset
}: SegmentModalProps &
  ApiRequestProps & {
    onSave: (input: Pick<SavedSegment, 'id' | 'name' | 'type'>) => void
    segment: SavedSegment
  }) => {
  const [name, setName] = useState(segment.name)
  const [type, setType] = useState<SegmentType>(segment.type)

  const { disabled, disabledMessage, onSegmentTypeChange } =
    useSegmentTypeDisabledState({
      siteSegmentsAvailable,
      user,
      setType
    })

  return (
    <SegmentActionModal onClose={onClose}>
      <FormTitle className="mb-8">Update segment</FormTitle>
      <SegmentNameInput
        value={name}
        onChange={setName}
        namePlaceholder={namePlaceholder}
      />
      <SegmentTypeSelector value={type} onChange={onSegmentTypeChange} />
      {disabled && <SegmentTypeDisabledMessage message={disabledMessage} />}
      <ButtonsRow>
        <SaveSegmentButton
          disabled={status === 'pending' || disabled}
          onSave={() => {
            const trimmedName = name.trim()
            const saveableName = trimmedName.length
              ? trimmedName
              : namePlaceholder
            onSave({ id: segment.id, name: saveableName, type })
          }}
        />
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ButtonsRow>
      {error !== null && (
        <ErrorPanel
          className="mt-4"
          errorMessage={
            error instanceof ApiError
              ? error.message
              : 'Something went wrong updating segment'
          }
          onClose={reset}
        />
      )}
    </SegmentActionModal>
  )
}

const FiltersInSegment = ({ segment_data }: { segment_data: SegmentData }) => {
  return (
    <>
      <SecondaryTitle>Filters in segment</SecondaryTitle>
      <div className="mt-2">
        <FilterPillsList
          className="flex-wrap"
          direction="horizontal"
          pills={segment_data.filters.map((filter) => ({
            className: 'dark:!shadow-black/60',
            plainText: plainFilterText({ labels: segment_data.labels }, filter),
            children: styledFilterText({ labels: segment_data.labels }, filter),
            interactive: false
          }))}
        />
      </div>
    </>
  )
}

const SecondaryTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="font-heading font-medium text-foreground">{children}</h2>
)

/** Keep this component styled the same as checkboxes in PlausibleWeb.Live.Installation.Instructions */
const Checkbox = ({
  id,
  checked,
  onChange,
  children
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) => {
  return (
    <label
      className="flex items-center justify-start gap-x-2 text-sm font-normal text-foreground"
      htmlFor={id}
    >
      <ShadcnCheckbox id={id} checked={checked} onCheckedChange={onChange} />
      {children}
    </label>
  )
}

const Placeholder = ({
  children,
  placeholder
}: {
  children: ReactNode | false
  placeholder: ReactNode
}) => (
  <span
    className={classNames(
      'rounded-md',
      children === false && 'bg-muted text-muted'
    )}
  >
    {children === false ? placeholder : children}
  </span>
)

const hasSiteSegmentPermission = (user: UserContextValue) => {
  return [Role.admin, Role.owner, Role.editor, 'super_admin'].includes(
    user.role
  )
}

export const SegmentModal = ({ id }: { id: SavedSegment['id'] }) => {
  const user = useUserContext()
  const { segments, limitedToSegment } = useSegmentsContext()
  const navigate = useAppNavigate()

  const segment = segments.find((s) => String(s.id) === String(id))

  let error: ApiError | null = null

  if (!segment) {
    error = new ApiError(`Segment not found with with ID "${id}"`, {
      error: `Segment not found with with ID "${id}"`
    })
  }

  const data = !error ? segment : null

  const showClearButton = canRemoveFilter(
    ['is', 'segment', [id]],
    limitedToSegment
  )

  return (
    <ModalWithRouting maxWidth="460px">
      <div className="mb-8 text-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <h1 className="break-all font-heading text-xl font-medium">
              {data ? data.name : 'Segment details'}
            </h1>
          </div>
        </div>

        <div className="mt-2 text-sm/5">
          <Placeholder placeholder={'Segment type'}>
            {data?.segment_data ? SEGMENT_TYPE_LABELS[data.type] : false}
          </Placeholder>
        </div>
        <Separator className="my-4" />
        {!!data?.segment_data && (
          <>
            <FiltersInSegment segment_data={data.segment_data} />

            <SegmentAuthorship
              segment={data}
              showOnlyPublicData={!user.loggedIn || user.role === Role.public}
              className="mt-4 text-sm"
            />
            <div className="mt-4">
              <ButtonsRow>
                {canExpandSegment({ segment: data, user }) && (
                  <AppNavigationLink
                    className={primaryNeutralButtonClassName}
                    path={rootRoute.path}
                    search={(s) => ({
                      ...s,
                      filters: data.segment_data.filters,
                      labels: data.segment_data.labels
                    })}
                    state={{
                      expandedSegment: data
                    }}
                  >
                    Edit segment
                  </AppNavigationLink>
                )}

                {showClearButton && (
                  <Button
                    variant="ghost"
                    className={removeFilterButtonClassname}
                    onClick={() =>
                      navigate({
                        path: rootRoute.path,
                        search: getSearchToRemoveSegmentFilter()
                      })
                    }
                  >
                    Remove filter
                  </Button>
                )}
              </ButtonsRow>
            </div>
          </>
        )}
        {error !== null && (
          <ErrorPanel
            className="mt-4"
            errorMessage={
              error instanceof ApiError
                ? error.message
                : 'Something went wrong loading segment'
            }
            onRetry={() => window.location.reload()}
          />
        )}
      </div>
    </ModalWithRouting>
  )
}
