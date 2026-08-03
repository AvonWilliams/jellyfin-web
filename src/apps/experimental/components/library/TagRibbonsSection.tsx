import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import React, { type FC } from 'react';

import { useApi } from 'hooks/useApi';
import { useGetItems } from 'hooks/useFetchItems';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'components/common/SectionContainer';
import { CardShape } from 'utils/card';
import { toTitleCase } from 'apps/experimental/features/libraries/constants/pickTiles';
import type { ParentId } from 'types/library';

interface TagRibbonsSectionProps {
    parentId: ParentId;
    collectionType: CollectionType | undefined;
    itemType: BaseItemKind[];
    tagName: string;
}

const TagRibbonsSection: FC<TagRibbonsSectionProps> = ({
    parentId,
    collectionType,
    itemType,
    tagName
}) => {
    const { __legacyApiClient__ } = useApi();

    const { isLoading, data: itemsResult } = useGetItems({
        sortBy: [ItemSortBy.Random],
        sortOrder: [SortOrder.Ascending],
        includeItemTypes: itemType,
        recursive: true,
        fields: [
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.MediaSourceCount
        ],
        imageTypeLimit: 1,
        enableImageTypes: [ImageType.Primary],
        limit: 25,
        tags: [tagName],
        enableTotalRecordCount: false,
        parentId: parentId ?? undefined
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!itemsResult?.Items?.length) {
        return null;
    }

    return <SectionContainer
        sectionHeaderProps={{
            title: toTitleCase(tagName)
        }}
        items={itemsResult.Items}
        cardOptions={{
            scalable: true,
            overlayPlayButton: true,
            showTitle: true,
            centerText: true,
            cardLayout: false,
            shape: collectionType === CollectionType.Music ? CardShape.SquareOverflow : CardShape.PortraitOverflow,
            showParentTitle: collectionType === CollectionType.Music,
            showYear: collectionType !== CollectionType.Music,
            serverId: __legacyApiClient__?.serverId()
        }}
    />;
};

export default TagRibbonsSection;
